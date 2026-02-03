export interface MenuTypeDefinition {
  id: string;
  label: string;
  icon: string;
  url: string | null;
  hasChildren: boolean;
  childUrlPrefix?: string;
}

export const MENU_TYPES: Record<string, MenuTypeDefinition> = {
  home: {
    id: "home",
    label: "홈",
    icon: "Home",
    url: "/",
    hasChildren: false,
  },
  popular: {
    id: "popular",
    label: "인기글",
    icon: "TrendingUp",
    url: "/popular",
    hasChildren: false,
  },
  free: {
    id: "free",
    label: "자유게시판",
    icon: "MessageSquare",
    url: null,
    hasChildren: true,
    childUrlPrefix: "/free",
  },
  notice: {
    id: "notice",
    label: "공지사항",
    icon: "Bell",
    url: null,
    hasChildren: true,
    childUrlPrefix: "/notice",
  },
  gallery: {
    id: "gallery",
    label: "갤러리",
    icon: "Image",
    url: null,
    hasChildren: true,
    childUrlPrefix: "/gallery",
  },
  qna: {
    id: "qna",
    label: "질문/답변",
    icon: "HelpCircle",
    url: null,
    hasChildren: true,
    childUrlPrefix: "/qna",
  },
  discussion: {
    id: "discussion",
    label: "토론게시판",
    icon: "Users",
    url: null,
    hasChildren: true,
    childUrlPrefix: "/discussion",
  },
  suggestion: {
    id: "suggestion",
    label: "건의사항",
    icon: "Lightbulb",
    url: null,
    hasChildren: true,
    childUrlPrefix: "/suggestion",
  },
  rule: {
    id: "rule",
    label: "규칙/가이드",
    icon: "BookOpen",
    url: null,
    hasChildren: true,
    childUrlPrefix: "/rule",
  },
};

export const MENU_TYPE_LIST = Object.values(MENU_TYPES);

export function getMenuType(typeId: string): MenuTypeDefinition | undefined {
  return MENU_TYPES[typeId];
}

export function generateChildUrl(typeId: string, slug: string): string {
  const menuType = getMenuType(typeId);
  if (!menuType?.childUrlPrefix) {
    return "#";
  }
  return `${menuType.childUrlPrefix}/${slug}`;
}
