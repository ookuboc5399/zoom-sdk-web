declare global {
  interface Window {
    env: {
      REACT_APP_AZURE_OPENAI_ENDPOINT: string;
      REACT_APP_AZURE_OPENAI_API_KEY: string;
      REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME: string;
    }
  }
}

export const azureConfig = {
  endpoint: window.env?.REACT_APP_AZURE_OPENAI_ENDPOINT || '',
  apiKey: window.env?.REACT_APP_AZURE_OPENAI_API_KEY || '',
  deploymentName: window.env?.REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME || ''
};

export const serviceConfig = {
  maxTokens: 1000,
  temperature: 0.7,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stopSequences: [],
  timeout: 30000
};
