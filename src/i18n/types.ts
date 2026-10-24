export type Language = 'km' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localize: (enValue?: string, kmValue?: string) => string;
  formatNumber: (num: number) => string;
}
