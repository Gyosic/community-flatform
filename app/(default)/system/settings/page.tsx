import { SiteConfigure } from "@/app/(default)/system/settings/SiteConfigure";
import { app } from "@/config";

const getConfig = async () => {
  try {
    const res = await fetch(new URL("/api/system/config", app.baseurl));

    const config = await res.json();

    return config;
  } catch {
    return null;
  }
};
export default async function SystemSettings() {
  const config = await getConfig();

  return <SiteConfigure config={config} />;
}
