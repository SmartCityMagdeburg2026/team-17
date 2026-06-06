function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const ORS_ENV = {
  apiKey: import.meta.env.VITE_ORS_API_KEY,
  host:
    requireEnv("VITE_ORS_HOST", import.meta.env.VITE_ORS_HOST),
};

export const BACKEND_ENV = {
  host: requireEnv("VITE_BACKEND_HOST", import.meta.env.VITE_BACKEND_HOST),
}