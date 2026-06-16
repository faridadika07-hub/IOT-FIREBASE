export interface SensorData {
  temperature: number;
  humidity: number;
}

export interface RelayData {
  relay1: number;
  relay2: number;
  relay3: number;
  relay4: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
