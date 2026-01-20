import Link from "next/link";

interface FooterProps {
  siteName?: string;
  showFooter?: boolean;
  copyrightText?: string;
}

export function Footer({
  siteName = "Community",
  showFooter = true,
  copyrightText,
}: FooterProps) {
  if (!showFooter) return null;

  const currentYear = new Date().getFullYear();
  const copyright = copyrightText || `© ${currentYear} ${siteName}. All rights reserved.`;

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 사이트 정보 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold">{siteName}</h3>
            <p className="text-sm text-muted-foreground">
              커뮤니티 플랫폼
            </p>
          </div>

          {/* 커뮤니티 링크 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">커뮤니티</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                홈
              </Link>
              <Link href="/boards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                게시판
              </Link>
              <Link href="/trending" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                인기 글
              </Link>
            </nav>
          </div>

          {/* 지원 링크 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">지원</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                도움말
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                자주 묻는 질문
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                문의하기
              </Link>
            </nav>
          </div>

          {/* 정책 링크 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">정책</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                개인정보처리방침
              </Link>
            </nav>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
