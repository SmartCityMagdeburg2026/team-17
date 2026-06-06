interface ImportMetaEnv {
  readonly VITE_ORS_API_KEY: string;
  readonly VITE_ORS_HOST?: string;
  readonly VITE_BACKEND_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@tabler/icons-react";
