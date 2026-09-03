import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fridayeducation.lms',
  appName: 'Friday Education',
  webDir: 'out',
  server: {
    url: 'https://lms-app-tan-iota.vercel.app',
    cleartext: false
  }
};

export default config;

