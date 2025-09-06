/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FRONTEND_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_TASK_SCHEDULER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
