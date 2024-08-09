// utils/awsClient.js
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: 'us-east-1', // Replace with your AWS region
  // Add credentials if necessary (AWS credentials or a profile)
});

export const getLLMResponse = async (inputText) => {
  try {
    const input = {
      modelId: 'arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-text-premier-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({ inputText }),
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    // Decode the Uint8Array response
    const decoder = new TextDecoder('utf-8');
    const bodyString = decoder.decode(response.body);

    // Parse the JSON response
    const bodyJson = JSON.parse(bodyString);

    // Extract the response text
    const responseText = bodyJson.outputText || 'No response text';

    return responseText;
  } catch (error) {
    console.error('Error invoking model:', error);
    throw new Error('Error processing your request.');
  }
};
