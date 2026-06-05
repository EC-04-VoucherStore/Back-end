import { Module } from '@nestjs/common';
import { RedisModule } from './common/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from './common/supabase/supabase.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [SupabaseModule, RedisModule, ScheduleModule.forRoot(), OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
