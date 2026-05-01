export interface Tick {
  symbol: string;
  timestamp: number;
  price: number;
  volume: number;
}

export interface Candle {
  symbol: string;
  timestamp: number; // Start of period
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Signal {
  id: string;
  symbol: string;
  direction: 'CALL' | 'PUT';
  entryTime: number;
  expiryTime: number;
  strategy: string;
  confidence: number;
  result?: 'WIN' | 'LOSS' | 'PENDING';
}

export interface AssetConfig {
  symbol: string;
  name: string;
  isLive: boolean;
  isSignalEnabled: boolean;
  type: string; // e.g. OTC
}

export interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  mode: 'Both' | 'Signal Only' | 'Alert Only';
  params: Record<string, any>;
}

export interface TelegramChat {
  id: string;
  chatId: string;
  name: string;
  permissions: {
    liveSignal: boolean;
    futurePre: boolean;
    futureResult: boolean;
    liveResult: boolean;
    customMsg: boolean;
    strategyAlert: boolean;
    signalsMenu: boolean;
    statsMenu: boolean;
    futureMenu: boolean;
  };
}

export interface BotSource {
  id: string;
  chatId: string;
  name: string;
  permissions: {
    signalsMenu: boolean;
    statsMenu: boolean;
    futureMenu: boolean;
    addListMenu: boolean;
  };
}

export interface FutureSignal {
  id: string;
  symbol: string;
  time: string; // HH:mm
  direction: 'UP' | 'DOWN' | 'CALL' | 'PUT';
  isProcessed: boolean;
  timestamp: number; // For scheduling
}

export interface SystemSettings {
  isSystemOn: boolean;
  isAIOn: boolean;
  botToken: string;
  minConfidence: number;
  signalCooldown: number;
  signalCutoff: number;
  preDeliveryMinutes: number;
  candleTimeframe: number;
  customMessage: string;
}
