"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
  Unlink,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
}: ToolbarButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={isActive}
            onPressedChange={onClick}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            {children}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [image, setImage] = useState<File[]>([]);

  const setLink = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const openLinkDialog = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  }, [editor]);

  const addImage = useCallback(() => {
    if (!image?.length) return;

    for (const img of image) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        editor
          .chain()
          .focus()
          .setImage({ src: fileReader.result as string })
          .run();
      };

      fileReader.readAsDataURL(img);
    }

    setImageDialogOpen(false);
    setImage([]);
  }, [editor, image]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border bg-muted/30 p-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          tooltip="실행 취소"
        >
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          tooltip="다시 실행"
        >
          <Redo className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editorState.isHeading1}
          tooltip="제목 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editorState.isHeading2}
          tooltip="제목 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editorState.isHeading3}
          tooltip="제목 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editorState.isBold}
          tooltip="굵게"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editorState.isItalic}
          tooltip="기울임"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editorState.isUnderline}
          tooltip="밑줄"
        >
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editorState.isStrike}
          tooltip="취소선"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editorState.isCode}
          tooltip="인라인 코드"
        >
          <Code className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editorState.isTextAlignLeft}
          tooltip="왼쪽 정렬"
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editorState.isTextAlignCenter}
          tooltip="가운데 정렬"
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editorState.isTextAlignRight}
          tooltip="오른쪽 정렬"
        >
          <AlignRight className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editorState.isBulletList}
          tooltip="글머리 기호"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editorState.isOrderedList}
          tooltip="번호 매기기"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editorState.isBlockquote}
          tooltip="인용"
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton onClick={openLinkDialog} isActive={editorState.isLink} tooltip="링크">
          <LinkIcon className="size-4" />
        </ToolbarButton>
        {editorState.isLink && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            tooltip="링크 제거"
          >
            <Unlink className="size-4" />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={() => setImageDialogOpen(true)} tooltip="이미지">
          <ImageIcon className="size-4" />
        </ToolbarButton>
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>링크 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={setLink}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>이미지 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <FileInput
                accept={{ image: ["image/*"] }}
                value={image}
                onChange={(e) => setImage(e as File[])}
                multiple
              />
              {/* <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
              /> */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={addImage}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import type { EditorStateSnapshot } from "@tiptap/react";
import FileInput from "@/components/shared/FileInput";
import { FileType } from "@/lib/zod/file";

/**
 * State selector for the MenuBar component.
 * Extracts the relevant editor state for rendering menu buttons.
 */
export function menuBarStateSelector(ctx: EditorStateSnapshot<Editor>) {
  return {
    // Text formatting
    isBold: ctx.editor.isActive("bold") ?? false,
    canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
    isItalic: ctx.editor.isActive("italic") ?? false,
    canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
    isStrike: ctx.editor.isActive("strike") ?? false,
    canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
    isCode: ctx.editor.isActive("code") ?? false,
    canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
    canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
    isUnderline: ctx.editor.isActive("underline") ?? false,
    canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,

    // Text Align
    isTextAlignLeft: ctx.editor.isActive({ textAlign: "left" }),
    canTextAlignLeft: ctx.editor.can().chain().focus().setTextAlign("left").run() ?? false,
    isTextAlignCenter: ctx.editor.isActive({ textAlign: "center" }),
    canTextAlignCenter: ctx.editor.can().chain().focus().setTextAlign("center").run() ?? false,
    isTextAlignRight: ctx.editor.isActive({ textAlign: "right" }),
    canTextAlignRight: ctx.editor.can().chain().focus().setTextAlign("right").run() ?? false,

    // Block types
    isParagraph: ctx.editor.isActive("paragraph") ?? false,
    isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
    isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
    isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
    isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
    isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
    isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,

    // Lists and blocks
    isBulletList: ctx.editor.isActive("bulletList") ?? false,
    isOrderedList: ctx.editor.isActive("orderedList") ?? false,
    isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
    isBlockquote: ctx.editor.isActive("blockquote") ?? false,

    // History
    canUndo: ctx.editor.can().chain().undo().run() ?? false,
    canRedo: ctx.editor.can().chain().redo().run() ?? false,

    // Link
    isLink: ctx.editor.isActive("link") ?? false,
  };
}

export type MenuBarState = ReturnType<typeof menuBarStateSelector>;
