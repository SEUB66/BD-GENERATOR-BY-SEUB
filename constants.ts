
import { ComicProject } from './types';

export const INITIAL_COMIC_DATA: ComicProject = {
  id: "project-" + Date.now(),
  title: "SCENE_START_LINK",
  author: "ANONYMOUS_STATION_USER",
  style: "Ultra High-End Professional Comic Art, Westfalia Van Aesthetic, Vibrant Pop Art colors, Clean Bold Lineart, Dynamic Composition, Studio Lighting, Primary colors with Neon Pink and Teal accents.",
  globalContext: "Theme: Mystery / Adventure / Cyber-Noir. Professional comic book textures. Neon Pink (#FF007F) and Turquoise (#38B2AC) accents.",
  characters: [
    { id: 'char-1', name: 'SEB', personality: 'Urbain, tech-savvy, calm driver, wearing a tech-jacket.' },
    { id: 'char-2', name: 'NADIA', personality: 'Heroic leader, tactical observer, wearing futuristic gear.' },
    { id: 'char-3', name: 'EEVEE', personality: 'Faithful Sheltie dog, wears a glowing neon collar, highly intelligent.' }
  ],
  pages: [
    { 
      pageNumber: 1, 
      title: "INIT_SEQUENCE", 
      panels: [
        { id: "p1-1", description: "Le van Westfalia Mystery BD Machine roule sur une route futuriste sous un ciel de néons. Seb est au volant, concentré. Nadia regarde la carte holographique. Eevee est assise fièrement à l'arrière.", status: 'idle' }
      ] 
    }
  ]
};
