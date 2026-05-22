/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module 'figma:asset/*' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_PORT: string
  readonly VITE_API_TEST_MODE: string
  readonly VITE_AUTH_TOKEN_KEY: string
  readonly VITE_AUTH_REFRESH_TOKEN_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
