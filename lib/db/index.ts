import { drizzle } from "drizzle-orm/node-postgres";
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
