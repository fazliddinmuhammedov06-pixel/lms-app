import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fridayeducation.lms',
  appName: 'Friday Education',
  webDir: 'out',
  server: {
    // Для отладки на реальном устройстве Android/iOS по Wi-Fi:
    // Настроено подключение к IP вашего ПК в локальной сети
    url: 'http://192.168.1.125:3000',
    cleartext: true
  }
};

export default config;

