import Image from "next/image";
import { useTheme } from "next-themes";
import { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NaverIconDark from "@/public/naver-icon-dark.png";
import NaverIconGreen from "@/public/naver-icon-green.png";

interface NaverButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: "standard" | "icon";
  text?: string;
}
export function NaverButton({
  appearance = "standard",
  text = "Sign in with Naver",
  className,
  ...props
}: NaverButtonProps) {
  const { theme } = useTheme();

  const imgSrc = theme === "dark" ? NaverIconDark : NaverIconGreen;

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        `flex w-full items-center justify-center gap-0 border-0 bg-[#03c75a] p-0 hover:bg-[#03c75a] dark:bg-[#48484a] dark:hover:bg-[#48484a]`,
        className,
      )}
      {...props}
    >
      {theme === "dark" ? (
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
          <Image
            src={imgSrc}
            className="h-9 w-9 object-cover"
            alt="Naver"
            width={48}
            height={48}
            quality={100}
          />
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center">
          <Image
            src={imgSrc}
            className="h-9 w-9 object-cover"
            alt="Naver"
            width={48}
            height={48}
            quality={100}
          />
        </div>
      )}
      {appearance === "standard" && <span className="text-white">{text}</span>}
    </Button>
  );
}
