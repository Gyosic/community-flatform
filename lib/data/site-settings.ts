import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

/**
 * 사이트 설정 조회
 */
export async function getSiteSettings() {
  try {
    const result = await db.select().from(siteSettings).limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return null;
  }
}
