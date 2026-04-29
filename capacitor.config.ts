import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor wraps the deployed website into native APK/IPA shells.
 *
 * Strategy: point `server.url` at the deployed Vercel URL. The mobile app is
 * a thin native shell that opens the live website in a WebView. This means:
 *  - One codebase. Update web → mobile updates instantly (no app store re-submit).
 *  - Razorpay Checkout works exactly as it does in mobile browsers.
 *  - PWA features (install, push) keep working.
 *
 * For a fully offline-bundled app, set `webDir: 'out'`, run `next build`
 * with `output: 'export'` enabled in next.config.js, and remove `server.url`.
 * Note: API routes won't work in that mode — use Razorpay Payment Pages instead.
 */
const config: CapacitorConfig = {
  appId: 'in.strangeratticlub.app',
  appName: 'Stranger Atti Club',
  webDir: 'out',
  server: {
    // Replace with your deployed URL (Vercel free tier).
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://strangeratticlub.vercel.app',
    cleartext: false,
  },
  android: {
    backgroundColor: '#FFF8E7',
    allowMixedContent: false,
  },
  ios: {
    backgroundColor: '#FFF8E7',
    contentInset: 'automatic',
  },
};

export default config;
