
import { ComicProject } from './types';

export const INITIAL_COMIC_DATA: ComicProject = {
  title: "THE MYSTERY BD MACHINE : WESTFALIA_SYNC",
  style: "Ultra High-End Professional Comic Art, Westfalia Van Aesthetic, Vibrant Pop Art colors, Clean Bold Lineart, Dynamic Composition, Studio Lighting, Primary colors with Neon Pink and Teal accents.",
  globalContext: `STUDIO CORE PARAMETERS MBDM OFFICIAL 2026:
- Theme: Mystery / Adventure / Cyber-Noir
- Aesthetics: Westfalia Van teal & dark grey colors. Professional comic book textures.
- Mandatory Colors: Teal (#38B2AC), Cyber Pink (#FF007F), Slate Grey (#2C2C34), Electric Blue.
- Characters: Consistent high-detail comic features.
- Protagonists: Seb (Urbain), Nadia (Heroic), Eevee (Sheltie).`,
  pages: [
    { 
      pageNumber: 1, 
      title: "SCENE_START_LINK", 
      panels: [
        { id: "p1-1", description: "Le van Westfalia Mystery BD Machine roule sur une route futuriste sous un ciel de néons. Seb est au volant, concentré. Nadia regarde la carte holographique. Eevee est assise fièrement à l'arrière.", status: 'idle' }
      ] 
    }
  ]
};
