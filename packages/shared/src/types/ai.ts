export type AiInsightType = 'daily_analysis' | 'anomaly' | 'qa_response' | 'weekly_summary';

export interface AiInsight {
  id: number;
  branchId: number;
  type: AiInsightType;
  reportDate: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AiAnalysisRequest {
  reportType: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

export interface AiQuestionRequest {
  question: string;
}

export interface AiAnomalyResult {
  hasAnomaly: boolean;
  description: string;
  severity: 'low' | 'medium' | 'high';
  metric: string;
  expectedRange: string;
  actualValue: string;
}
