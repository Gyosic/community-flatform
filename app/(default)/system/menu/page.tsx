import MenuConfigure from "@/app/(default)/system/menu/MenuConfigure";
import { app } from "@/config";

const getMenu = async () => {
  const res = await fetch(new URL("/api/menu", app.baseurl), { method: "GET" });

  const data = await res.json();

  return data;
};

export default async function SystemMenu() {
  const menu = await getMenu();

  return <MenuConfigure menuConfigure={menu} />;
}
