export interface ImageAsset {
  id: string;
  url: string;
  isUserUploaded: boolean;
  category: 'person' | 'cloth' | 'result';
}

export interface HistoryItem {
  id: string;
  personUrl: string;
  clothUrl: string;
  resultUrl: string;
  timestamp: number;
}

export enum AppStep {
  SELECT_PERSON = 1,
  SELECT_CLOTH = 2,
  GENERATE = 3,
}
