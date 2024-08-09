const { TranslationServiceClient } = require('@google-cloud/translate').v3;

const translate = async () => {
    const client = new TranslationServiceClient();

    // Specify your Google Cloud Project ID
    const projectId = 'ai-chatbot-translation';
    const location = 'global';

    const text = "Hello, world!";
    const targetLang = 'es';  // Spanish

    try {
        const request = {
            parent: client.locationPath(projectId, location),
            contents: [text],
            mimeType: 'text/plain',
            sourceLanguageCode: 'en',
            targetLanguageCode: targetLang,
        };

        const [response] = await client.translateText(request);
        console.log(`Translated text: ${response.translations[0].translatedText}`);
    } catch (error) {
        console.error('Error translating text:', error);
    }
};

translate();
