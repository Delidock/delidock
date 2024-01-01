import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
const config: CapacitorConfig = {
  appId: 'com.delidock.app',
  appName: 'DelidockApp',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body // or "body"
    },
    CapacitorHttp: {
      enabled: true,
    },
  }
};

export default config;
