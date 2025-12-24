import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datejar.app',
  appName: 'Date Jar',
  webDir: 'public',
  server: {
    url: 'https://datejar.com', // Production domain
    cleartext: true
  }
};

export default config;
