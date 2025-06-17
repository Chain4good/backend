/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ThankYouLetterResponse } from './types/thank-you-letter.type';
import { GeminiService } from 'src/gemini/gemini.service';
import { CampaignAnalysis } from './types/analyze-campaign.type';
import { TrustAnalysis } from './types/trust-analyze.type';
import { CampaignService } from 'src/campaign/campaign.service';
import { CampaignOptimization } from './types/campaign-optimization.type';
import { RecommendationResponse } from './types/campaign-recommendations.type';
import { UsersService } from 'src/users/users.service';
import { DonationService } from 'src/donation/donation.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private geminiService: GeminiService,
    @Inject(forwardRef(() => CampaignService))
    private campaignService: CampaignService,
    private userService: UsersService,
    private donationService: DonationService,
  ) {
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

  async analyzeCampaignWithGemini(
    title: string,
    description: string,
  ): Promise<CampaignAnalysis> {
    const prompt = `
      Hãy phân tích và tóm tắt chiến dịch từ thiện sau.
      Trả về kết quả dưới dạng JSON với định dạng chính xác như sau:
      {
        "summary": "tóm tắt ngắn gọn về chiến dịch",
        "analysis": "phân tích về tính thuyết phục, tính nhân văn và khả năng kêu gọi"
      }

      Thông tin chiến dịch:
      Tiêu đề: ${title}
      Mô tả: ${description}
    `;

    try {
      const result = await this.geminiService.generateContent(prompt);
      const data = JSON.parse(result);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    } catch (error) {
      console.error('Failed to analyze campaign with Gemini:', error);
      return {
        summary: 'Không thể phân tích chiến dịch.',
        analysis: 'Đã xảy ra lỗi trong quá trình phân tích.',
      };
    }
  }

  async analyzeCampaignTrust(campaignId: number): Promise<TrustAnalysis> {
    const campaign = await this.campaignService.findOne(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    const prompt = `
      Đánh giá độ tin cậy và sentiment của chiến dịch:
      - Tiêu đề: ${campaign.title}
      - Mô tả: ${campaign.description}
      
      Trả về JSON:
      {
        "trustScore": number, // 0-100
        "sentiment": "positive" | "neutral" | "negative",
        "credibilityFactors": ["yếu tố 1", "yếu tố 2"],
        "riskFactors": ["rủi ro 1", "rủi ro 2"],
        "recommendations": ["đề xuất 1", "đề xuất 2"]
      }
    `;
    const result = await this.geminiService.generateContent(prompt);
    const data = JSON.parse(result);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }

  async optimizeCampaignContent(
    title: string,
    description: string,
  ): Promise<CampaignOptimization> {
    const prompt = ` Bạn là một chuyên gia về truyền thông xã hội và viết nội dung từ thiện. Hãy phân tích và tối ưu hóa chiến dịch dưới đây, chỉ cải thiện cách diễn đạt, từ ngữ và cấu trúc – **không rút gọn hay bỏ bất kỳ thông tin nào**.
    Chiến dịch:
    Tiêu đề: ${title}
    Mô tả: ${description}
    
    YÊU CẦU NGHIÊM NGẶT:
    - KHÔNG được tóm tắt hoặc rút gọn mô tả
    - Phải giữ nguyên toàn bộ độ dài và nội dung gốc
    - Chỉ cải thiện: ngữ pháp, cách hành văn, cách diễn đạt và bố cục
    - Mô tả sau tối ưu **phải sử dụng định dạng HTML**, gồm các thẻ <p>, <ul>, <li> khi phù hợp
    
    Trả về kết quả ở định dạng JSON (nội dung bằng tiếng Việt):
    {
      "optimizedTitle": "Tiêu đề đã cải thiện, vẫn giữ nguyên ý nghĩa gốc",
      "optimizedDescription": "<div>Mô tả được cải thiện, sử dụng HTML đầy đủ, giữ nguyên nội dung và độ dài gốc</div>",
      "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"],
      "suggestedImprovements": [
        "Gợi ý cải thiện cách trình bày, bố cục hoặc ngôn từ",
        "Gợi ý tăng tính cảm xúc hoặc kết nối với người đọc"
      ],
      "targetAudienceInsights": [
        "Nhận định về nhóm người có khả năng quan tâm chiến dịch",
        "Phân tích hành vi hoặc nhu cầu của đối tượng mục tiêu"
      ]
    }
    `;

    try {
      const result = await this.geminiService.generateContent(prompt);

      const parsed = JSON.parse(result);

      if (parsed.optimizedDescription.length < description.length * 0.9) {
        throw new Error('Nội dung đã bị rút gọn quá nhiều');
      }

      if (!parsed.optimizedDescription.startsWith('<')) {
        parsed.optimizedDescription = `<div>${parsed.optimizedDescription}</div>`;
      }

      return parsed as CampaignOptimization;
    } catch (error) {
      console.error('Không thể tối ưu hóa nội dung chiến dịch:', error);
      throw new Error('Tối ưu hóa chiến dịch thất bại - Vui lòng thử lại');
    }
  }

  async getPersonalizedRecommendations(
    userId: number,
  ): Promise<RecommendationResponse> {
    const user = await this.userService.findById(userId);
    const userDonations = await this.donationService.findAllByUserId(userId);

    const donationHistory = userDonations.map((d) => ({
      campaignId: d.campaignId,
      amount: d.amount,
      categoryId: d.campaign.categoryId,
      date: d.donatedAt,
    }));

    const prompt = `
      Phân tích mẫu quyên góp của người dùng và đề xuất các chiến dịch phù hợp.
      
      Thông tin người dùng:
      - Địa chỉ ví: ${user?.address || 'Chưa xác định'} // Địa chỉ ví MetaMask
      - Lịch sử giao dịch: ${JSON.stringify(donationHistory)}
      
      Xem xét các yếu tố:
      - Mẫu giao dịch blockchain trước đây
      - Tần suất và số tiền quyên góp
      - Danh mục chiến dịch mà người dùng đã ủng hộ
      - Các tương tác với smart contract
      
      Trả về đề xuất chiến dịch dưới dạng JSON:
      {
        "recommendations": [
          {
            "campaignId": số, // ID chiến dịch
            "score": số (0-100), // Điểm đánh giá độ phù hợp
            "matchingFactors": ["yếu tố phù hợp 1", "yếu tố phù hợp 2"],
            "relevanceScore": số (0-1), // Điểm liên quan
            "blockchainFactors": {
              "gasFeeEstimate": "ước tính phí gas",
              "networkCompatibility": "độ tương thích mạng",
              "contractSecurity": "độ an toàn của hợp đồng"
            }
          }
        ],
        "explanations": ["giải thích 1", "giải thích 2"] // Các giải thích cho đề xuất
      }
    `;

    try {
      const result = await this.geminiService.generateContent(prompt);
      return JSON.parse(result) as RecommendationResponse;
    } catch (error) {
      console.error('Không thể tạo đề xuất:', error);
      throw new Error('Không thể tạo đề xuất chiến dịch');
    }
  }

  async textToSpeech(campaignId: number) {
    const campaign = await this.campaignService.findOne(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.audio) {
      return campaign.audio;
    }
    const article = campaign.description;
    if (!article || article.length < 50) {
      throw new Error('Article content is too short for TTS');
    }
    return await this.geminiService.tts(article, campaignId);
  }
}
