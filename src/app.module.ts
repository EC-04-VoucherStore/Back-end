import { Module } from '@nestjs/common';
import { RedisModule } from './common/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from './common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule, RedisModule, ScheduleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
