export type LanguageCode = 'auto' | 'darija' | 'arabic' | 'french' | 'english';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  language?: 'darija' | 'arabic' | 'french' | 'english';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechLocale: string;
  placeholder: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'auto',
    label: 'Auto Detect',
    nativeLabel: 'Auto / تلقائي',
    speechLocale: 'ar-MA',
    placeholder: 'Ask in Darija, Arabic, French, or English...',
  },
  {
    code: 'darija',
    label: 'Moroccan Darija',
    nativeLabel: 'Darija / الدارجة',
    speechLocale: 'ar-MA',
    placeholder: 'سول بالدارجة (كتَب بالعربية ولا بالعرابيزي 3, 7, 9)...',
  },
  {
    code: 'arabic',
    label: 'Modern Standard Arabic',
    nativeLabel: 'Arabic / العربية',
    speechLocale: 'ar-SA',
    placeholder: 'اكتب سؤالك باللغة العربية الفصحى...',
  },
  {
    code: 'french',
    label: 'French',
    nativeLabel: 'Français',
    speechLocale: 'fr-FR',
    placeholder: 'Posez votre question en français...',
  },
  {
    code: 'english',
    label: 'English',
    nativeLabel: 'English',
    speechLocale: 'en-US',
    placeholder: 'Ask any question in English...',
  },
];
