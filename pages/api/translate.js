import { TranslationServiceClient } from '@google-cloud/translate';

// Check if environment variables are loaded correctly
console.log('GOOGLE_APPLICATION_CREDENTIALS_JSON:', process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID);

const client = new TranslationServiceClient({
    credentials: {
      type: 'service_account',
      project_id: 'ai-chatbot-translation',
      private_key_id: 'd2f7d5c4a10c8246a07d3f739bcd33cfe2313b4f',
      private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCbeOs8vS3o7TZt\nD4cf9apRZpEFgMbehEAkJrBik0b360mcX84OLNnYxJhY9BuzeLZd1u3MudCfmAdl\nNdVXdQYcx8PObGGF89SAQebXFXjwnIpciASbDsuzQDci4BxMRBhqL/TWC0henglF\nhjH/MYtDrRBkgQU8xcZCu0nmkp9JQ7i6Im/MeacHViGOikqyu4e72w8Qu8Y4kxRf\n9/p1PgwO/q1k+jye+qCz/L5kaXnoFuN6r0hccNClWfTeB5hkBTnAtgvClGzVYo5B\nEEvE1YjXXOIWK0U7K/RIGQip10jyLmmSvxNubtQp/psKNmaBpA1ekVAtrbrgJVwa\nrFgOZStHAgMBAAECggEAA6Jj/Vt+wz8oUoxWYEzh2l1HbpWAEJuO1EmDPgqrUghS\nBDHJI1OxE/wkg4/RRfTAbpkjnfGKCvEG2zrS7eRybCHPVff6n6L/iLABsW1zEkzW\nfys+0FEcOeh6YXpTrwS4fWL5mjdRTcTr+pAUgx6pXr+g7niFotIMvGqcY6Nxzcia\nJIBmvyd83/vy7rxNkiFyIDMXao1rR9fgCj/Quvxm1HY2zRk+KFd8mAMKUGSfDtM2\nzPjcbvKmW/7oyspNhsSHTF2MI27oxhUtFXo28ZNbX8oXXF7X1J6x/LFTIjXi6W9u\naNNorQ7fh/E+zt3R1YYX59x0d8zTdxKNI6Ok2KQDQQKBgQDUQaweWvApG8nqV3i3\n3RRexIgetwicBINtyw0wwcM0XoNCCZ4s8Jk2ExHfidN2tCYxq5CdrZy8P3jfm7Gi\nIxqBpU/I7jP398z+Wpi5XxUrERFPgCU7CxuZHmmBjf2Kire89iGyx1MZ8MHBq8n9\nJQQWQQFzOvPpzKVHW24DLzvHKQKBgQC7g2Zm6CPjmzN/n3fJ591CFzRBnxMb9LQZ\nMVk+32fS3cJkyaO0g1PkXM0Sanixv+0Us8WIoEbTye2msBsW05+DJ0oaj7Che6vC\nQXzZSKAfwV8ZMWTrh98gcf0Xj/ulHjczlkuUteN7l1p3wz+C3vn2HtaoxQ7TxEqS\ntcFCG9fc7wKBgQDEMG+HH0ccuDLKCE/sosxRTBcFTOkITKOuuCBZEL/9h96LC5jI\nsRrsgHPkyuBKt/kVsB7bn71fwstW4/Isi4XUj5hPgN1INiOkdtjzfo9yXzRA55GC\nIaJAxXt/5F6Vz+JFJru/I74MHBz7hm4NLkm4yB0vBS6uzBl4+2mUR/RZAQKBgCvF\nNmgbFBWTKuhFjy7AQvOkevw+Z7WE321qCY0VlSSxwyjHsMD4TuLljrEXzWighnTo\nqdmEoEPbxO+99/TSHU/+IdwlYnOvbJ6BruUBgO8oskwtLYOVSc5HDW8smu8mKHiQ\nQsBJ3PoCkImYOAESj4KWHEF1Dkr8bPPmHWCTI0ZdAoGBAMlRdKyNawo0LyrDY5uw\njnq7Tp/TRJjI+dEV2jCttlFLGjvoTreM+EGJFCv2/2pVUO3X3k15b/oBXcsnY5zi\nqoy/t4G0JtKssYCfO930llcPyvq6aHRJrSI9cQOWlMQ06g0ujkFMkdNuLU+wodE6\nO8eiVzRc+FK05ip8/HU/9m2F\n-----END PRIVATE KEY-----`,
      client_email: 'goodluck@ai-chatbot-translation.iam.gserviceaccount.com',
      client_id: '112577998844107358986',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/goodluck%40ai-chatbot-translation.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com'
    }
  });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { text, targetLang = 'en' } = req.body;

  try {
    const projectId = await client.getProjectId();
    const location = 'global';
    const parent = client.locationPath(projectId, location);

    // Perform the translation and auto-detect the source language
    const [response] = await client.translateText({
      parent,
      contents: [text],
      mimeType: 'text/plain',
      targetLanguageCode: targetLang,
    });

    const detectedSourceLanguage = response.translations[0].detectedLanguageCode;

    res.status(200).json({
      translatedText: response.translations[0].translatedText,
      detectedSourceLanguage: detectedSourceLanguage
    });
  } catch (error) {
    console.error('Error during translation:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
}
