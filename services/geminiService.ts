
import { GoogleGenAI } from "@google/genai";
import { Character } from "../types";

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
    characters: Character[],
    references: { data: string, mimeType: string }[] = [],
    isRefinement: boolean = false
  ): Promise<string> {
    const client = this.getClient();
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("Clé API manquante.");
    }

    const charGuide = characters.map(c => `- ${c.name}: ${c.personality}`).join('\n');

    const baseStyle = `PREMIUM COMIC ART. Professional digital illustration.
- MANDATORY COLORS: Turquoise (#00E5FF), Neon Pink (#FF007F).
- STYLE: ${style}.
- CONTEXT: ${context}.
- CHARACTERS DNA:
${charGuide}`;

    const finalPrompt = isRefinement 
      ? `PATCH UPDATE. INSTRUCTION: ${prompt}. Keep SAME characters and composition. Style: ${baseStyle}`
      : `SCENE: ${prompt}. Style: ${baseStyle}`;

    try {
      const parts: any[] = [{ text: finalPrompt }];

      references.forEach((ref) => {
        if (ref.data && ref.data.includes(',')) {
          parts.push({
            inlineData: { data: ref.data.split(',')[1], mimeType: ref.mimeType }
          });
        }
      });

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: parts }],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(p => p.inlineData);

      if (imagePart?.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
      throw new Error("Génération échouée.");
    } catch (error: any) {
      console.error("Gemini Error:", error);
      throw new Error(error?.message || "Erreur de génération.");
    }
  }
}

export const geminiService = new GeminiService();
