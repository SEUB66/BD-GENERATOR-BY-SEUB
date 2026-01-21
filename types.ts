
export interface Character {
  id: string;
  name: string;
  personality: string;
  avatar?: string;
}

export interface Panel {
  id: string;
  description: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
}

export interface ComicPage {
  pageNumber: number;
  title: string;
  panels: Panel[];
}

export interface ComicProject {
  id: string;
  title: string;
  pages: ComicPage[];
  style: string;
  globalContext: string;
  characters: Character[];
  author: string;
  publishedAt?: string;
}

export interface Branding {
  van?: string;
  square?: string;
  banner?: string;
  title?: string;
}

export type ViewMode = 'studio' | 'assets' | 'library' | 'author' | 'reader';
