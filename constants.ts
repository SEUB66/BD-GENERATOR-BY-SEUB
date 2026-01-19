
import { ComicProject } from './types';

export const INITIAL_COMIC_DATA: ComicProject = {
  title: "MISSION GLITCH : PRESTIGE 2026",
  style: "High-End Professional Comic Art, Clean Lineart, Vibrant CMYK Colors, Dynamic Marvel Composition, Modern Studio Lighting, High Fidelity Textures, Retro-Futuristic Glitch Accents.",
  globalContext: `STUDIO CORE PARAMETERS seuB.CA 2026:
- Theme: Sci-Fi / Action Adventure
- Aesthetics: Premium Digital Comic v.2026
- Characters: Consistent high-fidelity features.
- Protagonists: Seb (Casquette Expos, Barbe), Nadia (Silhouette athlétique, Héroïque), Eevee (Sheltie Yeux Vairons).`,
  pages: [
    { 
      pageNumber: 0, 
      title: "COUVERTURE_OFFICIELLE", 
      panels: [
        { id: "p0-1", description: "Illustration de couverture épique : Seb, Nadia et Eevee devant un coucher de soleil sur les falaises de la Gaspésie, avec des distorsions glitch chromatiques dans le ciel.", status: 'idle' }
      ] 
    }
  ]
};
