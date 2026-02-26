export async function register() {
  // 서버 사이드에서만 실행
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // const { initializeDatabase } = await import("@/lib/db/init");
    // await initializeDatabase();
  }
}
