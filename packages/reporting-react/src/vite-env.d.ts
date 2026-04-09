/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_UI_VERSION?: string;
  readonly VITE_APP_UI_BUILD_TIME?: string;
  readonly VITE_APP_UI_BRANCH_NAME?: string;
  readonly VITE_APP_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

