import packageJson from "@/package.json";

/** App semver — single source of truth from package.json. */
export const APP_VERSION: string = packageJson.version;
