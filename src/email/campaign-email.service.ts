import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CampaignStatus } from '@prisma/client';

@Injectable()
export class CampaignEmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendCampaignApprovalEmail(userEmail: string, campaignName: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Campaign Approved',
      template: 'campaign-approval',
      context: {
        campaignName,
        status: 'approved',
      },
    });
  }

  async sendCampaignRejectionEmail(
    userEmail: string,
    campaignName: string,
    reason?: string,
  ) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Campaign Rejected',
      template: 'campaign-rejection',
      context: {
        campaignName,
        status: 'rejected',
        reason: reason || 'No specific reason provided',
      },
    });
  }

  async sendCampaignStatusUpdateEmail(
    userEmail: string,
    campaignTitle: string,
    campaignCreatorName: string,
    newStatus: CampaignStatus,
    campaignId: number,
    reason?: string,
  ) {
    const statusDisplayMap = {
      APPROVED: 'Đã phê duyệt',
      REJECTED: 'Đã từ chối',
      ACTIVE: 'Đang hoạt động',
      FINISHED: 'Đã kết thúc',
      CANCELLED: 'Đã hủy',
      PENDING: 'Chờ xét duyệt',
      DRAFT: 'Nháp',
    };

    const statusClassMap = {
      APPROVED: 'approved',
      REJECTED: 'rejected',
      ACTIVE: 'active',
      FINISHED: 'finished',
      CANCELLED: 'cancelled',
      PENDING: 'pending',
      DRAFT: 'draft',
    };

    const statusMessages = {
      APPROVED:
        'Chúc mừng! Chiến dịch của bạn đã được phê duyệt và có thể bắt đầu gây quỹ.',
      REJECTED:
        'Rất tiếc, chiến dịch của bạn đã bị từ chối. Vui lòng xem lại nội dung và gửi lại.',
      ACTIVE: 'Chiến dịch của bạn đã được kích hoạt và đang hoạt động.',
      FINISHED:
        'Chiến dịch của bạn đã kết thúc thành công. Cảm ơn bạn đã tham gia!',
      CANCELLED: 'Chiến dịch của bạn đã bị hủy bởi quản trị viên.',
      PENDING: 'Chiến dịch của bạn đang chờ xét duyệt từ quản trị viên.',
      DRAFT: 'Chiến dịch của bạn đã được chuyển về trạng thái nháp.',
    };

    const nextStepsMap = {
      APPROVED: 'Bạn có thể bắt đầu chia sẻ chiến dịch để thu hút sự ủng hộ.',
      REJECTED:
        'Vui lòng chỉnh sửa nội dung theo yêu cầu và gửi lại để xét duyệt.',
      ACTIVE: 'Hãy tích cực chia sẻ và cập nhật tiến độ chiến dịch.',
      FINISHED:
        'Bạn có thể xem báo cáo tổng kết và gửi lời cảm ơn đến các nhà tài trợ.',
      CANCELLED: 'Liên hệ với quản trị viên để biết thêm chi tiết.',
      PENDING: 'Vui lòng đợi quản trị viên xem xét và phê duyệt.',
      DRAFT: 'Bạn có thể tiếp tục chỉnh sửa và gửi lại khi sẵn sàng.',
    };

    const subject = `[Charity Platform] Cập nhật trạng thái chiến dịch: ${campaignTitle}`;

    // URL giả định - bạn cần thay thế bằng URL thực tế của frontend
    const campaignUrl = `${process.env.FRONTEND_URL || 'https://charity.example.com'}/campaigns/${campaignId}`;

    await this.mailerService.sendMail({
      to: userEmail,
      subject,
      template: 'campaign-status-update',
      context: {
        campaignCreatorName,
        campaignTitle,
        statusDisplay: statusDisplayMap[newStatus],
        statusClass: statusClassMap[newStatus],
        statusMessage: statusMessages[newStatus],
        nextSteps: nextStepsMap[newStatus],
        reason,
        campaignUrl,
      },
    });
  }
}
