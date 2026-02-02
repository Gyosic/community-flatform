"use client";
import { LucideIcon } from "lucide-react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { IconPicker } from "@/components/shared/IconPicker";
import { cn } from "@/lib/utils";

export function IconField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  className,
  isForm = true,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  return (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      isForm={isForm}
      className={cn(className, labelPosition === "left" ? "flex flex-1 items-center" : "flex-1")}
      labelCls={labelCls}
      icon={fieldModel.icon}
    >
      <IconPicker
        value={field.value}
        placeholder={fieldModel.placeholder || "선택하세요"}
        className="flex-1"
        onChange={(v) => field.onChange(v)}
      />
    </FormItemWrapper>
  );
}
