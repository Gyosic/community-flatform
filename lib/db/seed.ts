import { sysadmin } from "@/config";
import { hashPassword } from "../auth/password";
import { writeDb } from "./index";
import { boards, type NewBoard, permissions, roles, users } from "./schema";

/**
 * 데이터베이스 초기 데이터 생성
 */
async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. 기본 역할 생성
    console.log("Creating roles...");
    const roleData = [
      {
        name: "sysadmin",
        display_name: "시스템관리자",
        description: "시스템 전체를 관리하는 최고 권한자",
        min_level: 1,
        max_level: null,
        priority: 200,
        color: "#dc2626",
        badge_config: {
          icon: "shield-check",
          background_color: "#fee2e2",
          text_color: "#991b1b",
        },
      },
      {
        name: "admin",
        display_name: "관리자",
        description: "커뮤니티를 관리하는 관리자",
        min_level: 1,
        max_level: null,
        priority: 100,
        color: "#ef4444",
        badge_config: {
          icon: "crown",
          background_color: "#fef2f2",
          text_color: "#dc2626",
        },
      },
      {
        name: "moderator",
        display_name: "운영진",
        description: "게시판 관리 권한을 가진 운영진",
        min_level: 1,
        max_level: null,
        priority: 50,
        color: "#3b82f6",
        badge_config: {
          icon: "shield",
          background_color: "#dbeafe",
          text_color: "#2563eb",
        },
      },
      {
        name: "member",
        display_name: "일반회원",
        description: "일반 회원",
        min_level: 2,
        max_level: null,
        priority: 10,
        color: "#10b981",
        badge_config: {
          icon: "user",
          background_color: "#d1fae5",
          text_color: "#059669",
        },
      },
      {
        name: "newbie",
        display_name: "신규회원",
        description: "새로 가입한 회원",
        min_level: 1,
        max_level: 1,
        priority: 1,
        color: "#6b7280",
        badge_config: {
          icon: "user-plus",
          background_color: "#f3f4f6",
          text_color: "#4b5563",
        },
      },
    ];

    const insertedRoles = await writeDb
      .insert(roles)
      .values(roleData)
      .returning();
    console.log(`✅ Created ${insertedRoles.length} roles`);

    // 역할 ID 저장
    const sysadminRole = insertedRoles.find((r) => r.name === "sysadmin");
    const adminRole = insertedRoles.find((r) => r.name === "admin");
    const moderatorRole = insertedRoles.find((r) => r.name === "moderator");
    const memberRole = insertedRoles.find((r) => r.name === "member");
    const newbieRole = insertedRoles.find((r) => r.name === "newbie");

    // 2. 기본 권한 설정
    console.log("Creating permissions...");
    const permissionData = [
      // 시스템관리자 권한 (모든 권한)
      {
        role_id: sysadminRole?.id ?? "",
        board_id: null,
        can_read: 1,
        can_write: 1,
        can_comment: 1,
        can_delete: 1,
        can_edit: 1,
        can_pin: 1,
        can_manage: 1,
      },
      // 관리자 권한 (모든 권한)
      {
        role_id: adminRole?.id ?? "",
        board_id: null,
        can_read: 1,
        can_write: 1,
        can_comment: 1,
        can_delete: 1,
        can_edit: 1,
        can_pin: 1,
        can_manage: 1,
      },
      // 운영진 권한
      {
        role_id: moderatorRole?.id ?? "",
        board_id: null,
        can_read: 1,
        can_write: 1,
        can_comment: 1,
        can_delete: 1,
        can_edit: 1,
        can_pin: 1,
        can_manage: 0,
      },
      // 일반회원 권한
      {
        role_id: memberRole?.id ?? "",
        board_id: null,
        can_read: 1,
        can_write: 1,
        can_comment: 1,
        can_delete: 0,
        can_edit: 0,
        can_pin: 0,
        can_manage: 0,
      },
      // 신규회원 권한
      {
        role_id: newbieRole?.id ?? "",
        board_id: null,
        can_read: 1,
        can_write: 0,
        can_comment: 1,
        can_delete: 0,
        can_edit: 0,
        can_pin: 0,
        can_manage: 0,
      },
    ];

    const insertedPermissions = await writeDb
      .insert(permissions)
      .values(permissionData)
      .returning();
    console.log(`✅ Created ${insertedPermissions.length} permissions`);

    // 3. 시스템관리자 계정 생성 (초기 설치 시)
    console.log("Creating sysadmin user...");
    const sysadminPassword = await hashPassword(sysadmin.password);
    await writeDb.insert(users).values({
      email: sysadmin.email,
      name: "시스템관리자",
      password: sysadminPassword,
      role_id: sysadminRole?.id || "",
      level: 99,
      experience: 9999,
      is_active: true,
      is_email_verified: true,
      is_banned: false,
    });
    console.log(
      `✅ Created sysadmin user (${sysadmin.email} / ${sysadmin.password})`,
    );

    // 4. 샘플 게시판 생성
    console.log("Creating sample boards...");
    const boardData: NewBoard[] = [
      {
        name: "공지사항",
        slug: "notice",
        description: "중요한 공지사항을 확인하세요",
        type: "notice",
        parent_id: null,
        sort_order: 1,
        board_config: {
          allow_anonymous: false,
          allow_comments: true,
          allow_nested_comments: true,
          allow_attachments: true,
          max_attachment_size: 10,
          allowed_file_types: ["image/*", "application/pdf"],
          require_approval: false,
        },
        display_config: {
          posts_per_page: 20,
          show_author: true,
          show_view_count: true,
          show_like_count: true,
          card_layout: "list",
          thumbnail_size: "medium",
        },
      },
      {
        name: "자유게시판",
        slug: "free",
        description: "자유롭게 이야기를 나눠보세요",
        type: "general",
        parent_id: null,
        sort_order: 2,
        board_config: {
          allow_anonymous: true,
          allow_comments: true,
          allow_nested_comments: true,
          allow_attachments: true,
          max_attachment_size: 10,
          allowed_file_types: ["image/*", "video/*", "application/pdf"],
          require_approval: false,
        },
        display_config: {
          posts_per_page: 20,
          show_author: true,
          show_view_count: true,
          show_like_count: true,
          card_layout: "list",
          thumbnail_size: "medium",
        },
      },
      {
        name: "Q&A",
        slug: "qna",
        description: "궁금한 것을 물어보세요",
        type: "qna",
        parent_id: null,
        sort_order: 3,
        board_config: {
          allow_anonymous: false,
          allow_comments: true,
          allow_nested_comments: true,
          allow_attachments: true,
          max_attachment_size: 5,
          allowed_file_types: ["image/*"],
          require_approval: false,
        },
        display_config: {
          posts_per_page: 20,
          show_author: true,
          show_view_count: true,
          show_like_count: true,
          card_layout: "list",
          thumbnail_size: "small",
        },
      },
      {
        name: "갤러리",
        slug: "gallery",
        description: "사진과 이미지를 공유하세요",
        type: "gallery",
        parent_id: null,
        sort_order: 4,
        board_config: {
          allow_anonymous: false,
          allow_comments: true,
          allow_nested_comments: true,
          allow_attachments: true,
          max_attachment_size: 20,
          allowed_file_types: ["image/*"],
          require_approval: false,
        },
        display_config: {
          posts_per_page: 12,
          show_author: true,
          show_view_count: true,
          show_like_count: true,
          card_layout: "grid",
          thumbnail_size: "large",
        },
      },
    ];

    const insertedBoards = await writeDb
      .insert(boards)
      .values(boardData)
      .returning();
    console.log(`✅ Created ${insertedBoards.length} boards`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Default credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// 스크립트 실행
seed()
  .then(() => {
    console.log("\n✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
