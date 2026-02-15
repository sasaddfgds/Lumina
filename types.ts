
export type Language = 'en' | 'ru';
export type ViewStyle = 'modern' | 'typewriter' | 'swiss';

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  data: string; // base64
  previewUrl: string;
}

export interface Suggestion {
  id: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  startIndex: number;
  endIndex: number;
}

export interface ProjectState {
  title: string;
  content: string;
  attachments: FileAttachment[];
  suggestions: Suggestion[];
  isGenerating: boolean;
  history: string[];
}

export enum AIActionType {
  REWRITE = 'REWRITE',
  SHORTEN = 'SHORTEN',
  EXPAND = 'EXPAND',
  TONE_CHANGE = 'TONE_CHANGE',
  FIX_GRAMMAR = 'FIX_GRAMMAR',
  CUSTOM = 'CUSTOM',
  TRANSLATE_EN = 'TRANSLATE_EN',
  TRANSLATE_RU = 'TRANSLATE_RU'
}
