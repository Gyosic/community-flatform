"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Accept } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { cn } from "@/lib/utils";
import { FileType } from "@/lib/zod/file";

interface AvatarInputProps {
  accept?: Accept;
  value?: File[];
  onChange?: (...args: unknown[]) => void;
  className?: string;
  unoptimized?: boolean;
}
export default function AvatarInput({
  accept,
  value = [],
  onChange,
  className,
  unoptimized = false,
}: AvatarInputProps) {
  const [files, setFiles] = useState<File[] | FileType[] | undefined>(value);
  const [filePreview, setFilePreview] = useState<File[]>([]);

  const handleDrop = (inputs: File[]) => {
    setFiles(inputs);
  };

  const readAsDataURL = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Failed to read file"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const parseFiles = async (files: File[]) => {
    const newFilePreview = [];
    for (const file of files) {
      try {
        const src = await readAsDataURL(file);

        newFilePreview.push({
          ...file,
          name: file.name,
          src,
          lastModified: file.lastModified,
          size: file.size,
        });
      } catch {
        newFilePreview.push({ ...file, src: `/api/files${file.src}` });
      }
    }

    setFilePreview(newFilePreview as File[]);
  };

  const handleRemove = async () => {
    const [file] = files ?? [];

    if (file) {
      if (!(file instanceof File)) {
        await fetch(`/api/files${file.src}`, { method: "DELETE" });
      }
      setFiles([]);
    }
  };

  // 카메라 권한 요청
  // const requestCameraPermission = async () => {
  //   try {
  //     await navigator.mediaDevices.getUserMedia({ video: true });
  //   } catch {}
  // };

  useEffect(() => {
    // requestCameraPermission();

    parseFiles(files as File[]);

    onChange?.(files);
  }, [files]);

  return (
    <div className={cn("relative flex w-full flex-col gap-2", className)}>
      <Dropzone
        multiple={false}
        maxFiles={1}
        accept={accept}
        onDrop={handleDrop}
        onError={console.error}
        src={files as File[]}
        className="h-50 w-50 rounded-full p-0"
      >
        <DropzoneEmptyState />
        <DropzoneContent>
          {filePreview && !!filePreview.length && (
            <Image
              alt="Preview"
              className="h-full w-full object-cover"
              src={filePreview[0].src}
              width={0}
              height={0}
              unoptimized={unoptimized}
            />
          )}
        </DropzoneContent>
      </Dropzone>

      {filePreview && !!filePreview.length && (
        <div className="absolute top-[-10] right-[-5]">
          <Button
            variant="ghost"
            type="button"
            size="icon"
            className="hover:bg-transparent hover:text-red-500"
            onClick={() => handleRemove()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
