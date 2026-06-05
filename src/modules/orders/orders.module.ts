// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrderService } from './services/orders.service'; // Chỉnh lại đường dẫn nếu bạn để file ở thư mục khác
import { CartService } from './services/carts.service';
import { CartSyncService } from './services/cart-sync.service';

// Import các module dùng chung từ thư mục common
import { RedisModule } from '../../common/redis/redis.module';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [
    // Import Redis và Supabase để các Service trong module này có thể sử dụng được
    RedisModule,
    SupabaseModule,
  ],
  controllers: [
    OrdersController
  ],
  providers: [
    OrderService,
    CartService,
    CartSyncService // Đừng quên khai báo Cron Job service ở đây để nó tự động chạy ngầm
  ],
  exports: [
    // Nếu sau này module khác (ví dụ: VouchersModule) cần dùng lại OrderService, 
    // bạn có thể export nó ra ở đây. Hiện tại cứ tạm để trống hoặc export sẵn.
    OrderService
  ]
})
export class OrdersModule {}