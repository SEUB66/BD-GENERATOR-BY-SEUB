
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
  title: string;
  pages: ComicPage[];
  style: string;
  globalContext: string;
}

export interface ReferenceImages {
  seb?: string;
  nadia?: string;
  eevee?: string;
}

export type ViewMode = 'editor' | 'reader';
