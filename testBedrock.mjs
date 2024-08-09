import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Create a BedrockRuntime client
const client = new BedrockRuntimeClient({
  region: "us-east-1", // Replace with your AWS region
  // Add credentials if necessary (AWS credentials or a profile)
});

// Define the model invocation parameters
const input = {
  modelId: "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-text-premier-v1:0",
  contentType: "application/json",
  body: JSON.stringify({
    inputText: "How many continents are in the world?" // Adjust based on actual required parameter
  })
};

// Define a function to invoke the model
const invokeModel = async () => {
  try {
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    
    // Decode the Uint8Array response
    const decoder = new TextDecoder('utf-8');
    const bodyString = decoder.decode(response.body);

    // Parse the JSON response
    const bodyJson = JSON.parse(bodyString);

    // Print the response content
    console.log("Model Response:", bodyJson);
  } catch (error) {
    console.error("Error invoking model:", error);
  }
};

// Call the function
invokeModel();
