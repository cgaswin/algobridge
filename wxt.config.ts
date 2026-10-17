import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

// Mirrors src/features/scenario/config.ts so the manifest only grants access
// to the API the build actually talks to.
function apiHostPermission(mode: string): string {
  const env = loadEnv(mode, process.cwd(), "WXT_");
  const modeSpecific =
    mode === "production"
      ? env.WXT_PROBLEM_INSIGHTS_API_BASE_URL_PROD
      : env.WXT_PROBLEM_INSIGHTS_API_BASE_URL_DEV;
  const baseUrl = new URL(
    modeSpecific || env.WXT_PROBLEM_INSIGHTS_API_BASE_URL || DEFAULT_API_BASE_URL,
  );
  // Match patterns can't carry a port; a bare host matches every port.
  return `${baseUrl.protocol}//${baseUrl.hostname}/*`;
}

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: ({ mode }) => ({
    name: "AlgoBridge",
    description:
      "Connects DSA problems on LeetCode to practical real-world industry scenarios.",
    permissions: ["storage"],
    host_permissions: [apiHostPermission(mode)],
    action: {
      default_title: "Open AlgoBridge",
      default_icon: {
        "16": "icon/16.png",
        "32": "icon/32.png",
        "48": "icon/48.png",
        "128": "icon/128.png",
      },
    },
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "128": "icon/128.png",
    },
  }),
});
