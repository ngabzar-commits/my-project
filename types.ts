
export interface LogEntry {
  id: string;
  timestamp: string;
  method: 'POST' | 'GET';
  endpoint: string;
  status: number;
  payload: any;
  response: any;
  latency: number;
}

export interface SystemStats {
  totalRequests: number;
  avgLatency: number;
  successRate: number;
  activeConnections: number;
}

export interface MessageAnalysis {
  summary: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
}
