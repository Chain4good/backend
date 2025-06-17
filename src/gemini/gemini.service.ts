/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
import * as wav from 'wav';
import * as path from 'path';
import * as fs from 'fs';
import { UploadService } from 'src/upload/upload.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private googleGenAI: GoogleGenAI;
  private readonly outputDir: string;
  constructor(
    private configService: ConfigService,
    private readonly uploadService: UploadService, // Add this
    private readonly prisma: PrismaService, // Add this
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') || '',
    );
    this.googleGenAI = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY') || '',
    });
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    this.outputDir =
      this.configService.get<string>('AUDIO_OUTPUT_DIR') || 'audio-output';
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
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
      return (
        ' Làm cho Sadaltager có vẻ đồng cảm và thấu hiểu, và Achird nghe có lạc quan và tin vào tương lai tươi sáng:' +
        text.text()
      );
    } catch (error) {
      throw new Error(
        `Failed to generate content from image: ${error.message}`,
      );
    }
  }

  async tts(article: string, campaignId: number) {
    try {
      const conversation = await this.generateConversation(article);
      const response = await this.googleGenAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: conversation }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            languageCode: 'vi-VN',
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'Sadaltager',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Sadaltager' },
                  },
                },
                {
                  speaker: 'Achird',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Achird' },
                  },
                },
              ],
            },
          },
        },
      });
      const data =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const audioBuffer = Buffer.from(data || '', 'base64');

      const tempFileName = path.join(
        this.outputDir,
        `output-${Date.now()}.wav`,
      );
      await this.saveWaveFile(tempFileName, audioBuffer);

      try {
        const result = await this.uploadService.uploadAudio({
          path: tempFileName,
          filename: `campaign-audio-${campaignId}-${Date.now()}.wav`,
          mimetype: 'audio/wav',
        });

        await this.prisma.campaign.update({
          where: { id: campaignId },
          data: { audio: (result as { secure_url: string }).secure_url },
        });

        fs.unlinkSync(tempFileName);

        return (result as { secure_url: string }).secure_url;
      } catch (error) {
        if (fs.existsSync(tempFileName)) {
          fs.unlinkSync(tempFileName);
        }
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to generate TTS: ${error.message}`);
    }
  }

  async generateConversation(article: string): Promise<string> {
    try {
      const prompt = `
            Hãy chuyển đổi bài báo này thành một cuộc đối thoại tự nhiên giữa hai nhân vật:
            - Sadaltager (nam)
            - Achird (nữ)
            
            Yêu cầu:
            1. Giữ nguyên toàn bộ thông tin từ bài báo gốc
            2. Chuyển thành đối thoại tự nhiên, sinh động
            3. Hai nhân vật luân phiên trao đổi về các ý chính
            4. Sử dụng ngôn ngữ tiếng Việt tự nhiên, dễ hiểu
            5. Thể hiện cảm xúc và phản ứng của nhân vật
            6. Không bao gồm tên nhân vật trong lời thoại
            7. Đảm bảo rằng các câu thoại có độ dài hợp lý
            8. Lồng ghép khéo léo đoạn quảng cáo về Chain4Good một nền tảng phi lợi nhuận giúp các tổ chức phi chính phủ cá nhân và doanh nghiệp xã hội huy động vốn từ cộng đồng bằng công nghệ blockchain.
            
            Định dạng đầu ra:
            Sadaltager: [lời thoại]
            Achird: [lời thoại]
            
            Bài báo cần chuyển đổi:
            ${article}
            
            Lưu ý: 
            - Giữ nguyên mọi chi tiết quan trọng từ bài báo
            - Đảm bảo tính liên kết và mạch lạc trong đối thoại
            - Thể hiện tính cách riêng của từng nhân vật`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Failed to generate conversation: ${error.message}`);
    }
  }

  async saveWaveFile(
    filename: string,
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2,
  ) {
    return new Promise<void>((resolve, reject) => {
      // Create writer with proper type access
      const writer = new wav.FileWriter(filename, {
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      writer.on('finish', () => resolve());
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      writer.on('error', (err) => reject(err));

      writer.write(pcmData);
      writer.end();
    });
  }
}
