import { eq } from "drizzle-orm";
import { get, set } from "es-toolkit/compat";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { db, writeDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import FileSystem from "@/lib/fileSystem";
import { FileType } from "@/lib/zod/file";
import {
  configures,
  featureSchema,
  permissionSchema,
  seoSchema,
  siteSettingSchema,
  themeSchema,
} from "@/lib/zod/site-settings";

export async function GET() {
  try {
    const rows = await db.select().from(siteSettings).limit(1);

    const [row = null] = rows;

    return NextResponse.json(row);
  } catch (err) {
    console.info(err);
  }
}

const storageName = "config";
const fileSystemService = new FileSystem({ storageName });
const fileTypes = configures.reduce((acc, { schema, baseKey }) => {
  Object.entries(schema.shape).forEach(([fieldKey, { type, description = "{}" }]) => {
    const key = baseKey ? `${baseKey}.${fieldKey}` : fieldKey;
    const model = JSON.parse(description);
    const fieldType = model?.type ?? type;
    if (fieldType === "file") acc.push(key);
  });
  return acc;
}, [] as string[]);
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const flatData = Object.fromEntries(formData.entries());

    // flat key를 nested object로 변환
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(flatData)) {
      try {
        const parsed = JSON.parse(value as string);
        set(data, key, parsed);
      } catch {
        set(data, key, value);
      }
    }

    fileTypes.forEach(async (path) => {
      const files = (formData.getAll(path).filter((v) => v instanceof File) ?? []) as File[];
      const fileData = [] as FileType[];
      for (const file of files as File[]) {
        const buffer = await file.arrayBuffer();

        const [filename] = path.split(".").slice(-1);
        const src = `/${storageName}/${filename}`;
        fileData.push({
          name: file.name,
          lastModified: file.lastModified,
          type: file.type,
          size: file.size,
          src,
        });
        await fileSystemService.write({ filepath: filename, content: Buffer.from(buffer) });
      }
      set(data, path, fileData);
    });

    const siteConfig = await siteSettingSchema
      .extend({
        theme_config: z.preprocess((v) => {
          try {
            const value = typeof v === "string" ? JSON.parse(v) : v;
            return value;
          } catch {
            return v;
          }
        }, themeSchema),
        permission_config: z.preprocess((v) => {
          try {
            const value = typeof v === "string" ? JSON.parse(v) : v;
            return value;
          } catch {
            return v;
          }
        }, permissionSchema),
        features_config: z.preprocess((v) => {
          try {
            const value = typeof v === "string" ? JSON.parse(v) : v;
            return value;
          } catch {
            return v;
          }
        }, featureSchema),
        seo_config: z.preprocess((v) => {
          try {
            const value = typeof v === "string" ? JSON.parse(v) : v;
            return value;
          } catch {
            return v;
          }
        }, seoSchema),
      })
      .parseAsync(data);
    let result;

    try {
      await writeDb.transaction(async (tx) => {
        const rows = await tx.insert(siteSettings).values(siteConfig).returning();
        result = rows[0];
      });
    } catch (dbError) {
      // If transaction fails, clean up the uploaded file

      try {
        fileTypes.forEach(async (path) => {
          const files = get(siteConfig, path) || [];

          for (const { src } of files) {
            await fileSystemService.unlink({ filepath: src.replace(`/${storageName}`, "") });
          }
        });
      } catch (unlinkError) {
        console.error("Failed to cleanup file:", unlinkError);
      }

      throw dbError;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.info(err);
    if (err instanceof ZodError) {
      const [{ message } = {}] = JSON.parse(err?.message || "[]");

      return NextResponse.json(message, { status: 400 });
    }

    return NextResponse.json(err, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const flatData = Object.fromEntries(formData.entries());

    // flat key를 nested object로 변환
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(flatData)) {
      try {
        const parsed = JSON.parse(value as string);
        set(data, key, parsed);
      } catch {
        set(data, key, value);
      }
    }

    for (const path of fileTypes) {
      const files = (formData.getAll(path).filter((v) => v instanceof File) ?? []) as File[];
      const originalFiles = formData
        .getAll(path)
        .filter((v) => typeof v === "string")
        .map((v) => {
          try {
            return JSON.parse(v);
          } catch {
            return v;
          }
        })
        .flat() as string[];

      const fileData = [] as FileType[];
      for (const file of files as File[]) {
        const buffer = await file.arrayBuffer();

        const [filename] = path.split(".").slice(-1);
        const src = `/${storageName}/${filename}`;
        fileData.push({
          name: file.name,
          lastModified: file.lastModified,
          type: file.type,
          size: file.size,
          src,
        });
        await fileSystemService.write({ filepath: filename, content: Buffer.from(buffer) });
      }

      set(data, path, [...originalFiles, ...fileData]);
    }

    const { id, ...siteConfig } = await siteSettingSchema
      .extend({ id: z.string() })
      .parseAsync(data);

    let result;

    try {
      await writeDb.transaction(async (tx) => {
        const rows = await tx
          .update(siteSettings)
          .set(siteConfig)
          .where(eq(siteSettings.id, id))
          .returning();
        result = rows[0];
      });
    } catch (dbError) {
      // If transaction fails, clean up the uploaded file
      try {
        fileTypes.forEach(async (path) => {
          const files = get(siteConfig, path) || [];

          for (const { src } of files) {
            await fileSystemService.unlink({ filepath: src.replace(`/${storageName}`, "") });
          }
        });
      } catch (unlinkError) {
        console.error("Failed to cleanup file:", unlinkError);
      }

      throw dbError;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.info(err);
    if (err instanceof ZodError) {
      const [{ message } = {}] = JSON.parse(err?.message || "[]");

      return NextResponse.json(message, { status: 400 });
    }

    return NextResponse.json(err, { status: 500 });
  }
}
