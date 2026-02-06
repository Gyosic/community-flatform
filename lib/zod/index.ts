import { isNil } from "es-toolkit/compat";
import z, { ZodObject } from "zod";
import { FieldModel } from "@/types";

export function fieldModelBuilder({ schema }: { schema: ZodObject }) {
  type Schema = z.infer<typeof schema>;
  const defaultValues: Schema = {};
  const fieldModel = Object.entries(schema.shape).reduce(
    (acc, [fieldKey, { type, description = "{}" }]) => {
      const model = JSON.parse(description);
      acc[fieldKey] = { type, ...model };
      if (!isNil(model?.default)) defaultValues[fieldKey] = model.default;
      return acc;
    },
    {} as Record<string, FieldModel>,
  );

  return { fieldModel, defaultValues };
}
