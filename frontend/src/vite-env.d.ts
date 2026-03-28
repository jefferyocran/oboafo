/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TTS_USE_KHAYA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
