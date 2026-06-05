import { Module } from '@nestjs/common';
import { RedisModule } from './common/redis/redis.module';
import { SupabaseModule } from './common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule, RedisModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
