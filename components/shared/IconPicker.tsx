"use client";

import * as LucideIcons from "lucide-react";
import { ChevronsUpDown, X } from "lucide-react";
import { createElement, useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDynamicIcon } from "@/hooks/use-lucide-icon";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value?: string;
  onChange?: (iconName: string) => void;
  className?: string;
  placeholder?: string;
}

export function IconPicker({
  value,
  onChange,
  className,
  placeholder = "아이콘 선택",
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const iconComponent = useDynamicIcon(value);

  const iconList = [
    "Home",
    "Flame",
    "User",
    "UserCog",
    "UserPen",
    "UserPlus",
    "Wrench",
    "Cat",
    "Dog",
    "Bone",
    "Dribble",
    "Building2",
    "Castle",
    "Camera",
    "Shleld",
    "ShleldBan",
    "Phone",
    "ChessQueen",
    "Heart",
    "Boxes",
    "Medal",
    "Rose",
    "Mail",
    "Trash2",
    "Earth",
    "Bell",
    "PersonStanding",
    "Film",
    "Sun",
    "KeySquare",
    "Trophy",
    "Award",
    "AlarmClock",
    "Cloud",
    "Zap",
  ].reduce(
    (acc, icon) => {
      const iconComponent = useDynamicIcon(icon);
      if (iconComponent) acc.push([icon, iconComponent]);
      return acc;
    },
    [] as [string, LucideIcons.LucideIcon][],
  );
  const handleSelect = (iconName: string) => {
    onChange?.(iconName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn(className, "truncate")}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <>
              {/* <IconComponent className="h-4 w-4" /> */}
              {iconComponent && createElement(iconComponent, { className: "size-4" })}
            </>
          ) : (
            <span className="flex-1 text-left text-muted-foreground">{placeholder}</span>
          )}
          <div className="flex items-center gap-1">
            {value && (
              <span
                className="z-10 w-full cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("");
                }}
              >
                <X />
              </span>
            )}
            <ChevronsUpDown className="opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              <ScrollArea>
                <div className="flex flex-wrap gap-2">
                  {iconList.map(([iconName, icon]) => {
                    return (
                      <Button key={iconName} variant="ghost" onClick={() => handleSelect(iconName)}>
                        {icon && createElement(icon, { className: "size-6" })}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
