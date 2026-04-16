export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup/:code',
  ONBOARDING: '/onboarding',
  FIR: '/fir',
  DASHBOARD: '/',
  JOURNEY: '/journey',
  JOURNEY_STEP: '/journey/:stepId',
  PROSPECTOR: '/prospector',
  ACADEMY: '/academy',
  RANKING: '/ranking',
  ARENA: '/arena',
  LEADER: '/leader',
  NETWORK: '/network',
  PROFILE: '/profile',
} as const;

/** Helpers para construir URLs dinâmicas. */
export const buildRoute = {
  signup: (code: string) => `/signup/${encodeURIComponent(code)}`,
  journeyStep: (stepId: number | string) => `/journey/${stepId}`,
};
