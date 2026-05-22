import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.browserProfilingIntegration(),
  ],

  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  profilesSampleRate: 0.1,

  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry Event]', event);
    }

    const error = event.exception?.values?.[0];
    if (error?.type === 'ChunkLoadError') {
      event.fingerprint = ['chunk-load-error', error.value || 'unknown'];
    }

    return event;
  },

  ignoreErrors: [
    /ResizeObserver loop limit exceeded/i,
    /Non-Error promise rejection captured/i,
    /Loading chunk \d+ failed/i,
    /Network request failed/i,
    /Failed to fetch dynamically imported module/i,
  ],
});

export { captureException, captureMessage } from '@sentry/nextjs';
export default Sentry;
