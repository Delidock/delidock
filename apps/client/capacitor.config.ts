/// <reference types="@capacitor/splash-screen" />
import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
import { App as CapacitorApp } from '@capacitor/app'
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
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#111124',
      launchFadeOutDuration: 0,
      
    },
    
  }
};

export default config;
