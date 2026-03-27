# 디자인 시스템 가이드

## 기본 전제

- **Framework**: Next.js App Router
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **대상 서비스**: 네이버 카페처럼 관리자가 운영하는 커뮤니티 플랫폼

## 디자인 목표

- 화려함 ❌
- 안정성, 가독성, 확장성 ✅
- 관리자/일반 사용자 UI를 동시에 커버

## 스타일 원칙

1. 모든 색상은 CSS 변수로 정의
2. 컬러는 의미 기반 (primary, secondary, danger, muted)
3. radius / spacing / font-size는 토큰화
4. 컴포넌트는 shadcn 기본을 최대한 유지
5. Tailwind arbitrary value 금지
6. 모바일이 우선인 반응형 CSS
