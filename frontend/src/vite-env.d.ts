/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production API root including `/api`, e.g. `https://oboafo-api.vercel.app/api` */
  readonly VITE_API_BASE_URL?: string
  readonly VITE_TTS_USE_KHAYA?: string
  /**
   * When UI/answer language is English, which Khaya TTS voice to call (tw|ee|ga|dag).
   * Default in code: tw — so Listen still hits Khaya for English text (Twi synthesizer reading English).
   * Set to `none` or `false` to use the device Web Speech API for English instead.
   */
  readonly VITE_TTS_KHAYA_VOICE_FOR_EN?: string
  /**
   * When Khaya TTS fails (network, 502, etc.), fall back to the device Web Speech API.
   * Default: true. Set to `false` to only play Khaya audio (no browser voice).
   */
  readonly VITE_TTS_BROWSER_FALLBACK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
