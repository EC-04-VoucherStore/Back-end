import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);

  constructor(private supabase: SupabaseService) {}

  // Chạy mỗi 1 tiếng — tự động chuyển voucher hết hạn sang EXPIRED (RB-08)
  @Cron(CronExpression.EVERY_HOUR)
  async expireVouchers() {
    this.logger.log('Cronjob: Đang quét voucher hết hạn...');

    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('voucher')
      .update({ trang_thai: 'EXPIRED' })
      .eq('trang_thai', 'ACTIVE')
      .lt('ngay_kt', now)
      .select();

    if (error) {
      this.logger.error('Cronjob lỗi:', error.message);
      return;
    }

    this.logger.log(`Cronjob: Đã chuyển ${data?.length ?? 0} voucher sang EXPIRED`);
  }
}