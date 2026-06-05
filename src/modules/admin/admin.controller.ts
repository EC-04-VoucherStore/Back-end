import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('vouchers/pending')
  getPendingVouchers() {
    return this.adminService.getPendingVouchers();
  }

  @Patch('vouchers/:id/approve')
  approveVoucher(@Param('id') id: string) {
    return this.adminService.approveVoucher(id);
  }

  @Patch('vouchers/:id/reject')
  rejectVoucher(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.rejectVoucher(id, body.reason);
  }
}