// pages/api/invoke-model.js
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Initialize AWS SDK client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1', // Use environment variable for region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use environment variable for access key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Use environment variable for secret key
  },
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { inputText } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required.' });
    }

    const input = {
      modelId: process.env.AWS_MODEL_ID || 'arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-text-premier-v1:0', // Use environment variable for model ID
      contentType: 'application/json',
      body: JSON.stringify({ inputText }),
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await client.send(command);
      const bodyString = new TextDecoder("utf-8").decode(response.body);
      const bodyJson = JSON.parse(bodyString);

      console.log('Model response:', bodyJson); // Log the entire model response

      const responseText = bodyJson.results?.[0]?.outputText || 'No response text';
      res.status(200).json({ text: responseText });
    } catch (error) {
      console.error('Error invoking model:', error);
      res.status(500).json({ error: 'Error processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
