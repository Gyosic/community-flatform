"use client";

import type { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { BooleanField } from "@/components/form/fields/BooleanField";
import { ComboboxField } from "@/components/form/fields/ComboboxField";
import { DateField } from "@/components/form/fields/DateField";
import { FieldField } from "@/components/form/fields/FileField";
import { IconField } from "@/components/form/fields/IconField";
import { NumberField } from "@/components/form/fields/NumberField";
import { PasswordField } from "@/components/form/fields/PasswordField";
import { RadioField } from "@/components/form/fields/RadioField";
import { RatingField } from "@/components/form/fields/RatingField";
import { RecordField } from "@/components/form/fields/RecordField";
import { TagField } from "@/components/form/fields/TagField";
import { TextareaField } from "@/components/form/fields/TextareaField";
import { TextField } from "@/components/form/fields/TextField";
import type { FieldModel } from "@/types";

export interface TemplateFormItemProps<T extends FieldValues, K extends FieldPath<T>> {
  fieldModel: FieldModel;
  field: ControllerRenderProps<T, K>;
  className?: string;
  labelPosition?: "top" | "left";
  labelCls?: string;
  isForm?: boolean;
  isDuplicate?: boolean;
  onDuplicateCheck?: (key: string, value: string) => void;
}

export function TemplateFormItem<T extends FieldValues, K extends FieldPath<T>>(
  props: TemplateFormItemProps<T, K>,
) {
  switch (props.fieldModel.type) {
    case "number":
      return <NumberField {...props} />;
    case "textarea":
      return <TextareaField {...props} />;
    case "password":
      return <PasswordField {...props} />;
    case "switch":
    case "boolean":
      return <BooleanField {...props} />;
    case "hex-enum":
    case "enum":
      return <ComboboxField {...props} />;
    case "file":
      return <FieldField {...props} />;
    case "radio":
      return <RadioField {...props} />;
    case "datetime-local":
    case "date":
      return <DateField {...props} />;
    case "record":
      return <RecordField {...props} />;
    case "rating":
      return <RatingField {...props} />;
    case "tag":
      return <TagField {...props} />;
    case "icon":
      return <IconField {...props} />;
    default:
      return <TextField {...props} />;
  }
}
