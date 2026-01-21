
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.API_KEY || '';
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async generatePanelImage(
    prompt: string, 
    style: string, 
    context: string, 
    references: { data: string, mimeType: string }[] = [],
    isRefinement: boolean = false
  ): Promise<string> {
    const client = this.getClient();
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("ERREUR CRITIQUE: Clé API manquante. Veuillez vérifier l'environnement.");
    }

    const baseStyle = `PREMIUM PRESTIGE COMIC BOOK ART STYLE. Professional high-end digital illustration for THE MYSTERY BD MACHINE. 
- Technical Details: Clean ink line-work, vibrant colors, dynamic Marvel/DC action composition.
- MANDATORY COLOR THEME: You MUST integrate Turquoise (#00E5FF), Neon Pink (#FF007F), and Yellow Dijon (#D1A110) as prominent artistic accents.
- Lighting: Cyberpunk-esque with soft neon glow reflections.
- Shading: High-end studio look with subtle halftone textures.
- Style Descriptor: ${style}.
- Universe Lore: ${context}.`;

    const finalPrompt = isRefinement 
      ? `IMAGE MODIFICATION REQUEST (PATCH UPDATE). 
INSTRUCTION: ${prompt}. 
CRITICAL RULE: Maintain the EXACT SAME character models, composition, and art style of the provided reference image. ONLY apply the specific change requested. 
Emphasize the Neon Pink (#FF007F) accents where relevant.
Style Guide: ${baseStyle}`
      : `SCENE DESCRIPTION: ${prompt}. 
Artistically blend Turquoise (#00E5FF) and Neon Pink (#FF007F) into the composition.
Style Guide: ${baseStyle}`;

    try {
      const parts: any[] = [{ text: finalPrompt }];

      references.forEach((ref) => {
        if (ref.data && ref.data.includes(',')) {
          parts.push({
            inlineData: {
              data: ref.data.split(',')[1],
              mimeType: ref.mimeType
            }
          });
        }
      });

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: parts }],
        config: { 
          imageConfig: { 
            aspectRatio: "1:1"
          } 
        }
      });

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(p => p.inlineData);

      if (imagePart?.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
      
      throw new Error("L'IA n'a pas pu générer l'image. Essayez une description plus précise.");
    } catch (error: any) {
      console.error("Gemini AI Engine Error:", error);
      throw new Error(error?.message || "Erreur de génération.");
    }
  }
}

export const geminiService = new GeminiService();
