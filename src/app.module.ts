import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { RedemptionModule } from './modules/redemption/redemption.module';
import { CronjobModule } from './modules/cronjob/cronjob.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // Bật cronjob
    SupabaseModule,
    AuthModule,
    AdminModule,
    RedemptionModule,
    CronjobModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}