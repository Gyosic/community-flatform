## 개발 가이드

### 새로운 기능 추가하기

1. **데이터 모델 정의**: `lib/db/schema/`에 스키마 추가
2. **API 엔드포인트**: `app/api/`에 라우트 핸들러 추가
3. **UI 컴포넌트**: `components/`에 컴포넌트 추가
4. **UI 공통 컴포넌트**: `components/share/`에 컴포넌트 추가
5. **타입 정의**: `types/index.ts`에 타입 추가. 많아지면 데이터별로 파일 분리.

### 데이터 유효성 검사 및 폼 양식

- zod 기반 설계
  - formField 생성을 위해 describe 기능 활용
  - 예시)
  ```typescript
  export const boardConfigSchema = z.object({
    allow_anonymous: z.boolean().describe(JSON.stringify({ name: "익명 게시 허용", default: false })),
    allow_comments: z.boolean().describe(JSON.stringify({ name: "댓글 허용", default: true })),
    allow_nested_comments: z
      .boolean()
      .describe(JSON.stringify({ name: "대댓글 허용", default: true })),
    allow_attachments: z.boolean().describe(JSON.stringify({ name: "첨부파일 허용", default: true })),
    max_attachment_size: z
      .number()
      .min(1)
      .max(100)
      .describe(JSON.stringify({ name: "MB 단위", default: 10, placeholder: "1 ~ 100 MB" })),
    allowed_file_types: z.array(z.enum(["image", "pdf", "zip", "mp4"])).describe(
      JSON.stringify({
        name: "허용 확장자",
        type: "enum",
        enums: { 이미지: "image", PDF: "pdf", ZIP: "zip", MP4: "mp4" },
        multiple: true,
        default: ["image"],
      }),
    ),
    require_approval: z
      .boolean()
      .describe(JSON.stringify({ name: "게시글 승인 필요", default: false })),
  });
  ```
- `components/form/TemplateFormItem` 기반으로 Form 설계
  - formField는 `lib/zod`의 `fieldModelBuilder` 함수로 생성
  - 예시)
  ```typescript
  import { fieldModelBuilder } from "@/lib/zod"
  import { boardConfigSchema, BoardConfigSchema } from "@/lib/zod/boards"

  export function FormDemo () {
    const { formField, defaultValues } = fieldModelBuilder({ schema: boardConfigSchema })
    const form = useForm({
      resolver: zodResolver(boardConfigSchema),
      mode: "onBlur",
      defaultValues,
    });

    const { handleSubmit } = form;
    const onSubmit = handleSubmit(async (inputs) => {
      // 해당 api 로직...
    })

    return <Form {...form}>
      <form onSubmit={onSubmit}>
        {Object.entries(fieldModel).map(([fieldKey, fieldModel]) => {
          const key = baseKey ? `${baseKey}.${fieldKey}` : fieldKey;
          return (
            <FormField
              key={fieldKey}
              control={form.control}
              name={key as keyof BoardConfigSchema}
              render={({ field }) => {
                return <TemplateFormItem field={field} fieldModel={fieldModel}></TemplateFormItem>;
              }}
            ></FormField>
          );
        })}
      </form>
    </Form>
  }
  ```

### 공통 컴포넌트 활용

- 컴포넌트 복잡성 최소화
- 컴포넌트 단위 개발 후 조합하여 페이지 구성
- 재사용 컴포넌트는 공통 컴포넌트로 개발해서 사용

### 페이지 개발

- 데이터 베이스 기반. 게시판 설정에 맞춰서 페이지가 보이도록 구현.

## 데이터베이스 마이그레이션

```bash
# 마이그레이션
npm run db:generate
```
