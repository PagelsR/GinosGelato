/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_APPINSIGHTS_CONNECTION_STRING?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_GIT_COMMIT_SHA?: string
  readonly VITE_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
