import { TranslationServiceClient } from '@google-cloud/translate';

const client = new TranslationServiceClient({
    keyFilename: "C:\\Users\\badew\\Downloads\\ai-chatbot-translation-d2f7d5c4a10c.json" // Replace with the actual path to your JSON key file
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
