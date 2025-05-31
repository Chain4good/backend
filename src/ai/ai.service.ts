import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ThankYouLetterResponse } from './types/thank-you-letter.type';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async analyzeCampaign(title: string, description: string) {
    const prompt = `
            Phân tích và tóm tắt chiến dịch từ thiện sau:
            Tiêu đề: ${title}
            Mô tả: ${description}
            Trả về JSON với 2 field:
            - summary: tóm tắt ngắn gọn chiến dịch
            - analysis: phân tích ngắn gọn về mức độ thuyết phục, tính nhân văn, khả năng kêu gọi.
            `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0].message?.content;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(content || '{}');
  }

  async generateThankYouLetter(
    campaignName: string,
  ): Promise<ThankYouLetterResponse> {
    const prompt = `
      Bạn là một chuyên gia thiết kế email marketing cao cấp. Hãy tạo một email cảm ơn chuyên nghiệp với các yêu cầu sau:

      THÔNG TIN:
      - Tên chiến dịch: "${campaignName}"

      YÊU CẦU THIẾT KẾ:
      - Sử dụng HTML5 và inline CSS
      - Màu sắc: 
        + Màu chủ đạo: #16A34A (xanh lá)
        + Màu phụ: #F0FDF4 (nền nhạt)
        + Màu accent: #166534 (nhấn mạnh)
      - Font: 'Helvetica Neue', Arial, sans-serif
      - Responsive design
      - Có background pattern tinh tế
      - Thêm icon trái tim hoặc bàn tay nắm lại phù hợp

      NỘI DUNG:
      - Độ dài: 100-150 từ
      - Giọng điệu: Chân thành, ấm áp nhưng chuyên nghiệp
      - Nhấn mạnh tác động tích cực của sự đóng góp
      - Tránh klisê và từ ngữ sáo rỗng
      - Kết thúc bằng lời mời tiếp tục đồng hành

      Trả về JSON với định dạng:
      {
        "subject": "Tiêu đề email ngắn gọn, thu hút",
        "content": "HTML template với đầy đủ styling (inline CSS)"
      }
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    try {
      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Clean the response string of any control characters
      // eslint-disable-next-line no-control-regex
      const cleanContent = content.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

      return JSON.parse(cleanContent) as ThankYouLetterResponse;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        subject: 'Thank You for Your Support',
        content: '<p>Thank you for your generous contribution.</p>',
      };
    }
  }
}
