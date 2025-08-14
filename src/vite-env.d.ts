/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCOGS_CONSUMER_KEY: string
  readonly VITE_DISCOGS_CONSUMER_SECRET: string
  readonly VITE_DISCOGS_PERSONAL_ACCESS_TOKEN: string
  readonly VITE_DISCOGS_API_BASE_URL: string
  readonly VITE_DISCOGS_USER_AGENT: string
  readonly VITE_DISCOGS_RATE_LIMIT_PER_MINUTE: string
  readonly VITE_DISCOGS_RATE_LIMIT_AUTHENTICATED: string
  readonly VITE_DISCOGS_USERNAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}