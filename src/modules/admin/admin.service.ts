import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  async getAllUsers() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .auth.admin.listUsers();
    if (error) throw new BadRequestException(error.message);
    return { success: true, data: data.users, message: 'Lấy danh sách user thành công' };
  }

  async banUser(userId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .auth.admin.updateUserById(userId, { ban_duration: '876600h' });
    if (error) throw new NotFoundException(error.message);
    return { success: true, data, message: 'Khóa tài khoản thành công' };
  }

  async unbanUser(userId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .auth.admin.updateUserById(userId, { ban_duration: 'none' });
    if (error) throw new NotFoundException(error.message);
    return { success: true, data, message: 'Mở khóa tài khoản thành công' };
  }

  async getPendingVouchers() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('vouchers')
      .select('*, partners(business_name)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return { success: true, data, message: 'Lấy danh sách voucher chờ duyệt thành công' };
  }

  async approveVoucher(voucherId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('vouchers')
      .update({ status: 'ACTIVE', reject_reason: null })
      .eq('id', voucherId)
      .eq('status', 'PENDING')
      .select()
      .single();
    if (error || !data) throw new NotFoundException('Voucher không tồn tại hoặc không ở trạng thái PENDING');
    return { success: true, data, message: 'Duyệt voucher thành công' };
  }

  async rejectVoucher(voucherId: string, reason: string) {
    if (!reason?.trim()) throw new BadRequestException('Vui lòng nhập lý do từ chối');
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('vouchers')
      .update({ status: 'REJECTED', reject_reason: reason })
      .eq('id', voucherId)
      .eq('status', 'PENDING')
      .select()
      .single();
    if (error || !data) throw new NotFoundException('Voucher không tồn tại hoặc không ở trạng thái PENDING');
    return { success: true, data, message: 'Từ chối voucher thành công' };
  }
}