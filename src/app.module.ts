import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
