import { AzureOpenAIService } from './azure-openai';

interface AudioLevelCallback {
  (params: { level: number }): void;
}

interface AnalysisCallback {
  (analysis: string): void;
}

interface PerformanceMetrics {
  audioProcessingLatency: number;
  apiRequestLatency: number;
  memoryUsage: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  lastUpdated: number;
}

export class TestEnvironment {
  private azureService: AzureOpenAIService;
  private audioInterval: number | null = null;
  private onAudioLevel: AudioLevelCallback;
  private onAnalysis: AnalysisCallback;
  private isSimulationRunning: boolean = false;
  private useSimulatedAudio: boolean = false;
  private isRecording: boolean = false;
  private recordingPaused: boolean = false;
  private metrics: PerformanceMetrics = {
    audioProcessingLatency: 0,
    apiRequestLatency: 0,
    memoryUsage: {
      jsHeapSizeLimit: 0,
      totalJSHeapSize: 0,
      usedJSHeapSize: 0
    },
    lastUpdated: Date.now()
  };

  constructor(
    onAudioLevel: AudioLevelCallback,
    onAnalysis: AnalysisCallback,
    options: { useSimulatedAudio?: boolean } = {}
  ) {
    console.log('Creating TestEnvironment instance with options:', options);
    this.azureService = new AzureOpenAIService();
    this.onAudioLevel = onAudioLevel;
    this.onAnalysis = onAnalysis;
    this.useSimulatedAudio = options.useSimulatedAudio ?? false;
  }

  async startSimulation(): Promise<void> {
    if (this.isSimulationRunning) {
      console.log('Simulation already running, skipping...');
      return;
    }

    console.log('Starting test simulation');
    this.isSimulationRunning = true;

    if (this.audioInterval) {
      console.log('Clearing previous interval');
      window.clearInterval(this.audioInterval);
    }

    // Simulate audio level changes
    this.audioInterval = window.setInterval(() => {
      if (this.useSimulatedAudio) {
        const level = Math.random() * 0.5;
        console.log('Simulated audio level:', level);
        this.onAudioLevel({ level });

        // Simulate speech detection and analysis
        if (level > 0.3) {
          this.simulateConversation();
        }
      } else {
        // When not using simulated audio, still test Azure OpenAI integration
        if (Math.random() > 0.8) {
          this.simulateConversation();
        }
      }
    }, 5000);
  }

  private async simulateConversation(): Promise<void> {
    const startTime = Date.now();
    const mockConversations = [
      "物件の場所について教えてください。",
      "最寄り駅からの距離はどのくらいですか？",
      "周辺の施設はどうなっていますか？",
      "販売価格はいくらですか？",
      "リフォーム履歴はありますか？",
      "日当たりはどうですか？",
      "管理費はいくらですか？",
      "駐車場は付いていますか？"
    ];

    const mockConversation = mockConversations[Math.floor(Math.random() * mockConversations.length)];
    console.log('Simulated conversation:', mockConversation);

    try {
      const apiStartTime = Date.now();
      const analysis = await this.azureService.analyzeConversation(mockConversation);
      const apiLatency = Date.now() - apiStartTime;
      this.updateMetrics('api', apiLatency);

      console.log('Received analysis from Azure:', analysis);
      this.onAnalysis(analysis);
    } catch (error) {
      console.error('Test analysis failed:', error);
      this.onAnalysis(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }

    const audioLatency = Date.now() - startTime;
    this.updateMetrics('audio', audioLatency);
  }

  stopSimulation(): void {
    console.log('Stopping test simulation');
    this.isSimulationRunning = false;
    if (this.audioInterval) {
      window.clearInterval(this.audioInterval);
      this.audioInterval = null;
    }
  }

  startRecording(): void {
    console.log('Starting recording in test environment');
    this.isRecording = true;
    this.recordingPaused = false;
  }

  stopRecording(): void {
    console.log('Stopping recording in test environment');
    this.isRecording = false;
    this.recordingPaused = false;
  }

  pauseRecording(): void {
    console.log('Pausing recording in test environment');
    this.recordingPaused = true;
  }

  isRecordingActive(): boolean {
    return this.isRecording && !this.recordingPaused;
  }

  private updateMetrics(type: 'audio' | 'api', latency: number): void {
    const memory = (window.performance as any).memory || {
      jsHeapSizeLimit: 0,
      totalJSHeapSize: 0,
      usedJSHeapSize: 0
    };

    this.metrics = {
      ...this.metrics,
      [type === 'audio' ? 'audioProcessingLatency' : 'apiRequestLatency']: latency,
      memoryUsage: {
        jsHeapSizeLimit: memory.jsHeapSizeLimit / (1024 * 1024),
        totalJSHeapSize: memory.totalJSHeapSize / (1024 * 1024),
        usedJSHeapSize: memory.usedJSHeapSize / (1024 * 1024)
      },
      lastUpdated: Date.now()
    };
    console.log('Performance metrics updated:', this.metrics);
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return this.metrics;
  }
}
