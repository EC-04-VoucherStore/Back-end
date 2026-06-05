import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { RedemptionService } from './redemption.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('redemption')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class RedemptionController {
  constructor(private readonly redemptionService: RedemptionService) {}

  // Kiểm tra mã voucher (partner)
  @Post('verify')
  @Roles('partner')
  verifyVoucherCode(@Body() body: { ma_voucher_code: string; ma_cn: string }) {
    return this.redemptionService.verifyVoucherCode(body.ma_voucher_code, body.ma_cn);
  }

  // Xác nhận sử dụng (partner)
  @Post('redeem')
  @Roles('partner')
  redeemVoucherCode(@Body() body: { ma_voucher_code: string; ma_cn: string }) {
    return this.redemptionService.redeemVoucherCode(body.ma_voucher_code, body.ma_cn);
  }

  // Lịch sử mua hàng (customer)
  @Get('history/:ma_kh')
  @Roles('customer')
  getPurchaseHistory(@Param('ma_kh') ma_kh: string) {
    return this.redemptionService.getPurchaseHistory(ma_kh);
  }

  // Thống kê partner
  @Get('stats/partner/:ma_dt')
  @Roles('partner')
  getPartnerStats(@Param('ma_dt') ma_dt: string) {
    return this.redemptionService.getPartnerStats(ma_dt);
  }

  // Thống kê admin
  @Get('stats/admin')
  @Roles('admin')
  getAdminStats() {
    return this.redemptionService.getAdminStats();
  }
}