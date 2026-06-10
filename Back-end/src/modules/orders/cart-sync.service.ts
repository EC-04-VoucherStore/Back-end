// src/modules/orders/services/cart-sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from '../../common/redis/redis.service';
import { OrdersService } from './orders.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartSyncService {
  private readonly logger = new Logger(CartSyncService.name);
  private readonly DIRTY_SET_KEY = 'carts_to_sync';

  constructor(
    private readonly redisService: RedisService,
    private readonly supabaseService: SupabaseService,
    private readonly ordersService: OrdersService,
  ) {}

  // Chạy tự động mỗi 30 phút. Bạn có thể đổi thành EVERY_5_MINUTES nếu muốn
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCronSyncCarts() {
    this.logger.log('Bắt đầu đồng bộ giỏ hàng từ Redis xuống Database...');
    const client = this.redisService.getClient();
    const supabase = this.supabaseService.getClient();

    try {
      // 1. Lấy toàn bộ ma_kh có thay đổi
      const usersToSync = await client.smembers(this.DIRTY_SET_KEY);
      
      if (usersToSync.length === 0) {
        this.logger.log('Không có giỏ hàng nào cần đồng bộ.');
        return;
      }

      // 2. Lặp qua từng user để đồng bộ
      for (const maKh of usersToSync) {
        const { data: cartItems } = await this.ordersService.getCart(maKh);
        
        // Bắt đầu quá trình đồng bộ cho user này
        if (cartItems.length === 0) {
          // Nếu giỏ hàng rỗng (user đã xóa hết) -> Xóa trong DB
          await supabase.from('chi_tiet_gio_hang').delete().eq('ma_kh', maKh);
        } else {
          // Nếu có hàng -> Xóa cũ, Thêm mới
          const payload = cartItems.map(item => ({
            ma_ctgh: uuidv4(),
            ma_kh: maKh,
            ma_voucher: item.ma_voucher,
            so_luong_mua: item.so_luong_mua
          }));

          await supabase.from('chi_tiet_gio_hang').delete().eq('ma_kh', maKh);
          await supabase.from('chi_tiet_gio_hang').insert(payload);
        }

        // 3. Xóa ma_kh khỏi tập DIRTY_SET sau khi đồng bộ thành công
        await client.srem(this.DIRTY_SET_KEY, maKh);
      }

      this.logger.log(`Đã đồng bộ thành công giỏ hàng cho ${usersToSync.length} khách hàng.`);
    } catch (error) {
      this.logger.error('Có lỗi xảy ra trong quá trình đồng bộ giỏ hàng:', error);
    }
  }
}