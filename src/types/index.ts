export interface SessionInfo {
  id: string;
  title: string;
  speaker: string;
  description?: string;
}

export interface UserInputs {
  situation: 'opening' | 'learned' | 'closing';
  feelingAndNotes: string;
  personality: 'engineer' | 'gal' | 'hotblooded' | 'kansai';
}

export interface GeneratorStatus {
  status: 'checking' | 'readily' | 'after-download' | 'downloadable' | 'downloading' | 'unsupported';
  error?: string;
}
