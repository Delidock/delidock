import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.delidock.app',
  appName: 'debugger',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
