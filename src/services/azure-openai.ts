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
              content: `不動産営業のアシスタントとして、会話内容を分析し、以下の5点について日本語でアドバイスを提供してください：
1. 顧客の主な関心事と優先順位
   - 立地、価格、間取りなどの重視点
   - 具体的なニーズや制約条件

2. 物件に関する具体的な質問や懸念事項
   - 施設や設備に関する詳細な確認事項
   - 管理体制や修繕履歴への関心度

3. 提案すべき物件の特徴やメリット
   - 顧客ニーズに合致する要素
   - 競合物件との差別化ポイント

4. 価格や条件に関する交渉ポイント
   - 予算との整合性
   - 値引きや条件交渉の可能性

5. 次回の商談に向けた準備と推奨アクション
   - 用意すべき資料や情報
   - 具体的な提案内容

回答は箇条書きで簡潔に提供し、各項目に対して具体的な根拠を含めてください。
また、緊急度の高い要望や懸念事項があれば、優先的に対応すべき事項として明記してください。`
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
