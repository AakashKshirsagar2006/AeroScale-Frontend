export const env = {
  // Empty string = same origin (goes through the Vite proxy in dev).
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
};
