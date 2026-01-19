
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Note pour l'ingénieur : process.env.API_KEY doit être configuré dans ton environnement local ou Vercel.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generatePanelImage(
    prompt: string, 
    style: string, 
    context: string, 
    references: { data: string, mimeType: string }[] = []
  ): Promise<string> {
    const fullPrompt = `Retro-Modern High-End Comic Art Style.
STYLE SPEC: ${style}.
GLOBAL STORY LORE: ${context}.
SPECIFIC SCENE: ${prompt}.

CHARACTER VISUALS:
- NADIA: Athlete warrior build, chestnut bangs, intense heroic gaze.
- EEVEE: Fluffy Shetland Sheepdog with HETEROCHROMIA (One blue eye, one brown eye).
- SEB: Beard, Montreal Expos Cap, retro sports jacket.

COLOR & LIGHTING CORE:
- Integrate vibrant TURQUOISE (#00E5FF) and YELLOW DIJON (#D1A110) as primary accent colors.
- Use halftone dots (Ben-Day dots) for shading.
- Dynamic comic book composition, high contrast shadows, Marvel-style action rendering.
- Professional digital ink line-work.`;
    
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY_MISSING: Configure la variable d'environnement pour activer l'IA.");
      }

      const parts: any[] = references.map(ref => ({
        inlineData: {
          data: ref.data.split(',')[1],
          mimeType: ref.mimeType
        }
      }));

      parts.push({ text: fullPrompt });

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("EMPTY_RESPONSE: L'IA n'a pas retourné de candidats.");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("NO_IMAGE_PART: Aucun segment binaire d'image trouvé.");
    } catch (error) {
      console.error("Gemini Critical Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
