import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

/**
 * 사이트 설정 조회
 */
export async function getSiteSettings() {
  try {
    const result = await db
      .select()
      .from(siteSettings)
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return null;
  }
}

/**
 * 설치 완료 여부 확인
 */
export async function isInstalled(): Promise<boolean> {
  try {
    const settings = await getSiteSettings();
    return settings !== null;
  } catch (error) {
    console.error("Failed to check installation status:", error);
    return false;
  }
}

/**
 * 초기 사이트 설정 생성
 */
export async function createInitialSettings(data: {
  site_name: string;
  site_description?: string;
  layout_config?: Record<string, unknown>;
  theme_config?: Record<string, unknown>;
}) {
  try {
    const result = await db
      .insert(siteSettings)
      .values({
        site_name: data.site_name,
        site_description: data.site_description || "",
        layout_config: data.layout_config || {
          header_visible: true,
          footer_visible: true,
          sidebar_position: "left",
          home_layout: "default",
        },
        theme_config: data.theme_config || {
          primary_color: "#000000",
          dark_mode_default: false,
          button_style: "default",
        },
        feature_config: {
          allow_registration: true,
          require_email_verification: false,
          allow_social_login: false,
        },
        seo_config: {
          meta_title: data.site_name,
          meta_description: data.site_description || "",
        },
        email_config: null,
        security_config: {
          password_min_length: 8,
          session_timeout: 86400,
        },
        notification_config: {
          email_notifications: false,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Failed to create initial settings:", error);
    throw error;
  }
}
