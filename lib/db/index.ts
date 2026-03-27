import {
  between,
  Column,
  ColumnDataType,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  Operators,
  or,
  SQL,
  sql,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { map } from "es-toolkit/compat";
import { Pool } from "pg";
import { postgresql } from "@/config";

// INSERT/UPDATE/DELETE용 Pool (쓰기 전용)
export const writePool = new Pool({
  ...postgresql,
  max: 10, // 최대 연결 수 (쓰기 작업용)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// SELECT용 Pool (읽기 전용)
export const readPool = new Pool({
  ...postgresql,
  max: 20, // 최대 연결 수 (읽기 작업용, 더 많게 설정 가능)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 기본 db는 쓰기용으로 유지 (하위 호환성)
export const writeDb = drizzle({ client: writePool });

// 읽기 전용 db 인스턴스
export const db = drizzle({ client: readPool });

writePool.on("error", (err) => {
  console.error("Unexpected error on idle client (write pool)", err);
  process.exit(-1);
});

readPool.on("error", (err) => {
  console.error("Unexpected error on idle client (read pool)", err);
  process.exit(-1);
});

type QueryBuilderConstructor<P extends TableConfig> = {
  table: PgTableWithColumns<P>;
};
export class QueryBuilder<P extends TableConfig> {
  private conditions: SQL[] = [];
  table: PgTableWithColumns<P>;

  constructor({ table }: QueryBuilderConstructor<P>) {
    this.table = table;
  }

  operators(
    col: Column,
    operator: keyof Operators,
    value: ColumnDataType,
    isNumeric: boolean = false,
  ) {
    switch (operator) {
      case "eq":
        return eq(col, value);
      case "ne":
        return ne(col, value);
      case "gt":
        // 빈 문자열이면 NULL 체크 추가
        return isNumeric
          ? sql`${col} != '' AND CAST(${col} AS NUMERIC) > ${value}`
          : gt(col, value);
      case "gte":
        return isNumeric
          ? sql`${col} != '' AND CAST(${col} AS NUMERIC) >= ${value}`
          : gte(col, value);
      case "lt":
        return isNumeric
          ? sql`${col} != '' AND CAST(${col} AS NUMERIC) < ${value}`
          : lt(col, value);
      case "lte":
        return isNumeric
          ? sql`${col} != '' AND CAST(${col} AS NUMERIC) <= ${value}`
          : lte(col, value);
      case "inArray":
        if (!Array.isArray(value))
          throw new Error(`Invalid value for 'in' operator: ${value}는 배열이어야 합니다.`);

        return inArray(col, value);
      case "between":
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error(
            `Invalid value for 'between' operator: ${value}는 두 개의 값을 포함해야 합니다.`,
          );
        }
        return isNumeric
          ? sql`${col} != '' AND CAST(${col} AS NUMERIC) BETWEEN ${value[0]} AND ${value[1]}`
          : between(col, value[0], value[1]);
      case "notBetween":
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error(
            `Invalid value for 'notBetween' operator: ${value}는 두 개의 값을 포함해야 합니다.`,
          );
        }
        return isNumeric
          ? sql`${col} != '' AND CAST(${col} AS NUMERIC) NOT BETWEEN ${value[0]} AND ${value[1]}`
          : or(lt(col, value[0]), gt(col, value[1]));
      case "like":
        return like(col, `%${value}%`);
      case "ilike":
        return ilike(col, `%${value}%`);
      case "isNull":
        return isNull(col);
      case "isNotNull":
        return isNotNull(col);
      case "sql":
        const [head, tail] = value.split("column");
        const sqlChunks = [sql.raw(head), sql`${col}`, sql.raw(tail)];
        return sql.join(sqlChunks);
      default:
        throw new Error(`Invalid operator: ${operator}는 지원되지 않는 연산자입니다.`);
    }
  }

  querying(params: {
    pagination?: { pageIndex: number; pageSize: number };
    sort?: Record<string, string>[];
    [key: string]: unknown;
  }) {
    const { pagination, sort, ..._params } = params;
    const where = [];
    const sorts = [];
    const paging: { limit?: number; offset?: number } = {};

    for (const [key, value] of Object.entries(_params)) {
      const [k, operator] = key.split(".");
      const operation = this.operators(
        this.table[k],
        operator as keyof Operators,
        value as ColumnDataType,
      );

      where.push(operation);
    }

    if (sort && sort.length > 0) {
      const conditions = map(sort, ({ id, desc }) => {
        const col = this.table[id];

        if (!col) {
          if (id.toString().includes(".")) {
            const [jsonField, jsonPath] = id.toString().split(".");
            const jsonCol = this.table[jsonField as string];

            if (!jsonCol) {
              if (desc)
                return sql.raw(String(id) + " DESC NULLS LAST"); // drizzleOrmDesc(sql.raw(String(id)));
              else return sql.raw(String(id) + " ASC NULLS LAST"); // drizzleOrmAsc(sql.raw(String(id)));
            }

            // const jsonSortExpr = sql`${jsonCol}->>${sql.raw(`'${jsonPath}'`)}`;

            if (desc)
              return sql`${jsonCol}->>${sql.raw(`'${jsonPath}'`)} DESC NULLS LAST`; // drizzleOrmDesc(jsonSortExpr);
            else return sql`${jsonCol}->>${sql.raw(`'${jsonPath}'`)} ASC NULLS LAST`; // drizzleOrmAsc(jsonSortExpr);
          }
        }

        if (desc)
          return sql`${col} DESC NULLS LAST`; // drizzleOrmDesc(col);
        else return sql`${col} ASC NULLS LAST`; // drizzleOrmAsc(col);
      });

      sorts.push(...conditions);
    }

    if (pagination) {
      const { pageSize, pageIndex } = pagination;

      Object.assign(paging, { limit: pageSize, offset: pageIndex * pageSize });
    }

    return { where, sorts, limit: paging?.limit, offset: paging?.offset };
  }
}
