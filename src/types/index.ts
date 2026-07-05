export interface SessionInfo {
  id: string;
  title: string;
  speaker: string;
  description?: string;
}

export interface UserInputs {
  situation: 'pre_event' | 'attendance' | 'session' | 'review';
  feelingAndNotes: string;
  personality: 'engineer_logical' | 'engineer_passion' | 'gal' | 'hotblooded' | 'kansai';
  includeMeta: boolean;
}

export interface GeneratorStatus {
  status: 'checking' | 'readily' | 'after-download' | 'downloadable' | 'downloading' | 'unsupported';
  error?: string;
}
