import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
      META_VERIFY_TOKEN: 'test_verify_token',
      WHATSAPP_ACCESS_TOKEN: 'test_access_token',
      WHATSAPP_PHONE_NUMBER_ID: 'test_phone_number_id',
      META_APP_ID: 'test_app_id',
      META_APP_SECRET: 'test_app_secret',
      META_GRAPH_API_VERSION: 'v21.0',
    },
  },
});
