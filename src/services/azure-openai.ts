import axios from 'axios';
import { azureConfig } from '../config/azure';

export class AzureOpenAIService {
  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;

  constructor() {
    console.log('Initializing AzureOpenAIService with config:', {
      endpoint: azureConfig.endpoint,
      deploymentName: azureConfig.deploymentName,
      hasApiKey: !!azureConfig.apiKey
    });

    if (!azureConfig.endpoint || !azureConfig.apiKey || !azureConfig.deploymentName) {
      throw new Error('Azure OpenAI configuration is missing');
    }

    this.endpoint = azureConfig.endpoint;
    this.apiKey = azureConfig.apiKey;
    this.deploymentName = azureConfig.deploymentName;
  }

  async analyzeConversation(text: string): Promise<string> {
    try {
      const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2023-05-15`;

      const response = await axios.post(
        url,
        {
          messages: [
            {
              role: 'system',
              content: '不動産営業のアシスタントとして、会話内容を分析し、以下の3点について日本語でアドバイスを提供してください：\n1. 顧客の関心事\n2. 提案すべきポイント\n3. 次のアクション'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'No analysis available';
    } catch (error) {
      console.error('Azure OpenAI analysis failed:', error);
      throw new Error(`Failed to analyze conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
