

export interface GeneratedContent {
  productName: string;
  alternatives: string;
  shortCaption: string;
  promotionalCaption: string;
  hashtags: string;
  audience: string;
  tagline: string;
  timestamp: number;
}

export interface PostDraft {
  id: string;
  image: string; // Base64 string
  content: GeneratedContent;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type Language = 'en' | 'hi' | 'es';

export interface FacebookUser {
  name: string;
  id?: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    }
  };
}

export interface FacebookPage {
  name: string;
  id: string;
  access_token: string;
  category?: string;
}

export interface FacebookUploadResponse {
  id: string;
  post_id?: string;
}
