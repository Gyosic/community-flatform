"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagInputProps extends React.ComponentProps<"input"> {
  value?: string[];
  onChange?: (...args: unknown[]) => void;
}
export function TagInput({ value, onChange, ...props }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(value || []);
  const [newTag, setNewTag] = useState("");
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  useEffect(() => {
    onChange?.(tags);
  }, [tags]);

  return (
    <div className="w-full space-y-2">
      <div className="mb-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          {...props}
          id="tags"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          className="flex-1"
        />
        <Button type="button" onClick={addTag} variant="outline">
          추가
        </Button>
      </div>
    </div>
  );
}
