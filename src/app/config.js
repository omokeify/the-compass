export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'Compass',
  url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  environment: import.meta.env.MODE,
};

export const featureFlags = {
  useMockData: true,
  enableBackend: Boolean(import.meta.env.VITE_SUPABASE_URL),
  enablePayments: Boolean(import.meta.env.VITE_PAYMENTS_PROVIDER),
};
