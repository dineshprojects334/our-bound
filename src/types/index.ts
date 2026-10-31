export type AppStage =
  | 'login'
  | 'questions'
  | 'transition'
  | 'memories'
  | 'letter'
  | 'celebration'
  | 'gallery'
  | 'admin'
  | 'jumpGame';


export interface QuestionOption {
  id: string;
  text: string;
  feedback?: string;
  isYes?: boolean;
}

export interface Question {
  id: string;
  order: number;
  question: string;
  options: QuestionOption[];
  allowEscapeNo?: boolean;
  onAnswerMessage?: string;
  customTease?: string[];
}

export interface Memory {
  id: string;
  image: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  sticker?: string;
  rotation?: number;
}

export interface SecretLetterConfig {
  heading: string;
  subtitle: string;
  envelopeSealText: string;
  paragraphs: string[];
  signOff: string;
  buttonText: string;
}

export interface CelebrationConfig {
  recipientName: string;
  heroPhoto: string;
  mainHeadline: string;
  supportingMessage: string;
  makeAWishButtonText: string;
  revealedWishMessage: string;
  finalMessage: string;
  replayButtonText: string;
}

export interface SiteConfig {
  recipientName: string;
  senderName: string;
  login: {
    headline: string;
    subtitle: string;
    usernamePlaceholder: string;
    passwordPlaceholder: string;
    unlockButtonText: string;
    validPasscodes: string[];
    validUsernames: string[];
    hintText: string;
  };
  questions: Question[];
  transition: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  memoriesHeader: {
    heading: string;
    subtitle: string;
    ctaButtonText: string;
  };
  memories: Memory[];
  galleryPhotos: GalleryPhoto[];
  letter: SecretLetterConfig;
  celebration: CelebrationConfig;
  theme: {
    hotPink: string;
    blushPink: string;
    rose: string;
    lavender: string;
    purple: string;
    midnightPlum: string;
  };
}

export interface GalleryPhoto {
  id: string;
  src: string;       // path like /gallery/photo1.jpg or cloud URL / base64
  caption?: string;  // optional fun caption
  storage_path?: string; // cloud storage path if stored in Supabase
  created_at?: string;
}

// Supabase cloud memory (from DB)
export interface CloudMemory {
  id: string;
  title: string;
  description: string;
  storage_path: string;
  image_url: string;
  date_taken?: string;
  location?: string;
  sticker?: string;
  rotation?: number;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

