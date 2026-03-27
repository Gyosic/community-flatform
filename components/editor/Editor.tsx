"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "./EditorToolbar";

const lowlight = createLowlight(common);

interface EditorProps {
  content?: string;
  onChange?: (html: string, text: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function Editor({
  content = "",
  onChange,
  placeholder = "내용을 입력하세요...",
  editable = true,
  className,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "m-0 h-50",
        },
        allowBase64: true,
        inline: true,
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML(), editor.getText());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-40 p-4 focus:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={className}>
      <EditorToolbar editor={editor} />
      <div className="rounded-b-md border border-t-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
