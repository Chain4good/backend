/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') || '',
    );
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let textResponse = response.text();

      // Clean and parse JSON response
      try {
        // Remove markdown code blocks if present
        textResponse = textResponse.replace(/^```json\s*/, '');
        textResponse = textResponse.replace(/\s*```$/, '');

        // Remove any trailing commas in objects/arrays
        textResponse = textResponse.replace(/,(\s*[}\]])/g, '$1');

        // Clean any non-JSON content before or after
        textResponse = textResponse.replace(/^[^{[]+/, '');
        textResponse = textResponse.replace(/[^}\]]+$/, '');

        // Attempt to parse the cleaned JSON
        const jsonParsed = JSON.parse(textResponse.trim());
        return JSON.stringify(jsonParsed, null, 2);
      } catch (parseError) {
        console.warn('Failed to parse JSON response:', parseError.message);
        console.warn('Raw response:', textResponse);
        return textResponse;
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  async generateContentFromImage(prompt: string, imageUrl: string) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const response = await fetch(imageUrl);
      const imageBytes = await response.arrayBuffer();

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: Buffer.from(imageBytes).toString('base64'),
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const text = await result.response;
      return text.text();
    } catch (error) {
      throw new Error(
        `Failed to generate content from image: ${error.message}`,
      );
    }
  }
}
