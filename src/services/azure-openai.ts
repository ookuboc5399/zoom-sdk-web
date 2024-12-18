import { AzureOpenAI } from 'openai';
import { azureConfig } from '../config/azure';

export class AzureOpenAIService {
  private client: AzureOpenAI;

  constructor() {
    console.log('Initializing AzureOpenAIService with config:', {
      endpoint: azureConfig.endpoint,
      deploymentName: azureConfig.deploymentName,
      hasApiKey: !!azureConfig.apiKey
    });

    if (!azureConfig.endpoint || !azureConfig.apiKey || !azureConfig.deploymentName) {
      throw new Error('Azure OpenAI configuration is missing');
    }

    try {
      this.client = new AzureOpenAI({
        apiKey: azureConfig.apiKey,
        endpoint: azureConfig.endpoint,
        deployment: azureConfig.deploymentName,
        apiVersion: '2024-02-15-preview'
      });
      console.log('AzureOpenAIService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AzureOpenAIService:', error);
      throw error;
    }
  }

  async analyzeConversation(text: string): Promise<string> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: '不動産営業のアシスタントとして、会話内容を分析し、以下の3点について日本語でアドバイスを提供してください：\n1. 顧客の関心事\n2. 提案すべきポイント\n3. 次のアクション'
        },
        {
          role: 'user' as const,
          content: text
        }
      ];

      const result = await this.client.chat.completions.create({
        messages,
        model: azureConfig.deploymentName,
        temperature: 0.7,
        max_tokens: 800
      });

      return result.choices[0]?.message?.content || 'No analysis available';
    } catch (error) {
      console.error('Azure OpenAI analysis failed:', error);
      throw new Error(`Failed to analyze conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
