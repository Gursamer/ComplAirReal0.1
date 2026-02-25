export type Severity = "low" | "medium" | "high";

export interface RawReport {
  report_id?: string;
  filename?: string;
  timestamp?: string;
  source_file?: string;
  document_hash?: string;
  analysis_profile?: string;
  regulations?: string[];
  overall_score?: number;
  severity?: Severity;
  clauses?: Array<{
    clause_id?: string;
    title?: string;
    category?: string;
    text?: string;
  }>;
  gdpr_matches?: Array<{
    clause_id?: string;
    article?: string;
    regulation?: string;
    snippet?: string;
    similarity_score?: number;
  }>;
  risk_scores?: Array<{
    clause_id?: string;
    risk_score?: number;
    issues?: string[];
    severity?: Severity;
  }>;
  suggested_fixes?: Array<{
    clause_id?: string;
    rationale?: string;
    referenced_articles?: string[];
    suggested_text?: string;
  }>;
  executive_summary?: {
    overall_risk_score?: number;
    total_clauses?: number;
    high_risk_clauses?: number;
    key_findings?: string[];
  };
}

export interface NormalizedClause {
  id: string;
  title: string;
  category: string;
  text: string;
  riskScore: number;
  severity: Severity;
  issues: string[];
  matches: Array<{
    article: string;
    regulation: string;
    snippet: string;
    similarity: number;
  }>;
  suggestedFix?: {
    rationale: string;
    referencedArticles: string[];
    text: string;
  };
}

export interface NormalizedReport {
  id: string;
  filename: string;
  timestamp: string;
  overallScore: number;
  severity: Severity;
  highRiskCount: number;
  missingRequirementsCount: number;
  topRegulation: string;
  estimatedTimeSavedHours: number;
  keyFindings: string[];
  clauses: NormalizedClause[];
}

export interface ReportListItem {
  id: string;
  filename: string;
  timestamp: string;
  score?: number;
  severity?: Severity;
}

export interface ReportListResponse {
  count: number;
  reports: Array<{
    id: string;
    source_file?: string;
    profile?: string;
    timestamp?: string;
    score?: number;
    severity?: Severity;
  }>;
}
