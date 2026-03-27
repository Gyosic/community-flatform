import { NextRequest } from "next/server";
import z from "zod";

export const parseQuery = <T extends z.ZodSchema>(req: NextRequest, schema: T): z.infer<T> => {
  const params = new URL(req.url).searchParams;

  const parsed = schema.parse(params);

  return parsed;
};
