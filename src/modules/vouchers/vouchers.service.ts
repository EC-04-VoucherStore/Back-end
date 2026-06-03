import { Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import { SupabaseService } from '../../supabase/supabase.service';
import { VoucherStatus } from './enums/voucher-status.enum';

@Injectable()
export class VouchersService {
  constructor(private readonly supabaseService: SupabaseService) {}
  private currentId = 1;

  async createVoucher(dto: CreateVoucherDto) {
    if (dto.GiaBan > dto.GiaGoc) {
      throw new BadRequestException('GiaBan phải <= GiaGoc');
    }
    if (dto.NgayBD >= dto.NgayKT) {
      throw new BadRequestException('NgayBD phải < NgayKT');
    }
    if (dto.NgayKT <= new Date()) {
      throw new BadRequestException('NgayKT phải > ngày hiện tại');
    }

    const voucherData = {
      ma_voucher: `VC${this.currentId++}`,
      ma_dt: dto.MaDT,
      ma_pl: dto.MaPL,
      ma_taxon: dto.MaTaxon,
      ten_voucher: dto.TenVoucher,
      mo_ta: dto.MoTa,
      gia_goc: dto.GiaGoc,
      gia_ban: dto.GiaBan,
      so_luong_phat_hanh: dto.SoLuongPhatHanh,
      so_luong_da_ban: 0,
      ngay_bd: dto.NgayBD,
      ngay_kt: dto.NgayKT,
      banner_url: dto.bannerUrl,
      trang_thai: VoucherStatus.DRAFT,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('voucher')
      .insert(voucherData)
      .select();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      data,
      message: 'Tạo voucher thành công',
    };
  }

  async getAllVouchers() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('voucher')
      .select('*');

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      data,
    };
  }

  async getVoucherbyID(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('voucher')
      .select('*')
      .eq('ma_voucher', id)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      data,
    };
  }

  async updateVoucher(id: string, payload: any) {
    const { data: voucher, error: findError } = await this.supabaseService
      .getClient()
      .from('voucher')
      .select('*')
      .eq('ma_voucher', id)
      .single();

    if (findError || !voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    if (
      voucher.trang_thai === VoucherStatus.REJECTED ||
      voucher.trang_thai === VoucherStatus.SCHEDULED
    ) {
      payload.trang_thai = VoucherStatus.PENDING;
    }

    if (voucher.trang_thai === VoucherStatus.DRAFT) {
      payload.trang_thai = VoucherStatus.DRAFT;
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('voucher')
      .update(payload)
      .eq('ma_voucher', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      data,
      message: 'Cập nhật voucher thành công',
    };
  }

  async removeVoucher(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('voucher')
      .delete()
      .eq('ma_voucher', id);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      message: 'Xóa voucher thành công',
    };
  }

  async submitVoucher(id: string) {
    const { data: voucher, error: findError } = await this.supabaseService
      .getClient()
      .from('voucher')
      .select('*')
      .eq('ma_voucher', id)
      .single();

    if (findError || !voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    if (voucher.trang_thai !== VoucherStatus.DRAFT) {
      throw new BadRequestException('Voucher không thể gửi duyệt');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('voucher')
      .update({
        trang_thai: VoucherStatus.PENDING,
      })
      .eq('ma_voucher', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      data,
      message: 'Gửi duyệt voucher thành công',
    };
  }

  async searchVoucher(query: any) {
    let request = this.supabaseService.getClient().from('voucher').select('*');

    // Lọc Tên Voucher
    if (query.TenVoucher) {
      request = request.ilike('ten_voucher', `%${query.TenVoucher}%`);
    }

    // Lọc Trạng Thái
    if (query.TrangThai) {
      request = request.eq('trang_thai', query.TrangThai);
    }

    // Lọc Giá Thấp nhất
    if (query.GiaMin) {
      request = request.gte('gia_ban', query.GiaMin);
    }

    // Giá cao nhất
    if (query.GiaMax) {
      request = request.lte('gia_ban', query.GiaMax);
    }

    const { data, error } = await request;

    if (error) {
      throw new BadRequestException(error.message);
    }

    let results = data ?? [];

    // Tỉ lệ giảm giá
    if (query.TiLeGiamMin) {
      results = results.filter(
        (v) => ((v.gia_goc - v.gia_ban) / v.gia_goc) * 100 >= query.TiLeGiamMin,
      );
    }

    return {
      success: true,
      total: results.length,
      data: results,
    };
  }

  async approveVoucher(id: string) {
    const { data: voucher, error: findError } = await this.supabaseService
      .getClient()
      .from('voucher')
      .select('*')
      .eq('ma_voucher', id)
      .single();

    if (findError || !voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    if (voucher.trang_thai !== VoucherStatus.PENDING) {
      throw new BadRequestException('Voucher không ở trạng thái chờ duyệt');
    }

    const now = new Date();

    const status =
      new Date(voucher.ngay_bd) > now
        ? VoucherStatus.SCHEDULED
        : VoucherStatus.ACTIVE;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('voucher')
      .update({
        trang_thai: status,
      })
      .eq('ma_voucher', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      data,
      message: 'Duyệt voucher thành công',
    };
  }

  async rejectVoucher(id: string) {
    const { data: voucher, error: findError } = await this.supabaseService
      .getClient()
      .from('voucher')
      .select('*')
      .eq('ma_voucher', id)
      .single();

    if (findError || !voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    if (voucher.trang_thai !== VoucherStatus.PENDING) {
      throw new BadRequestException('Voucher không ở trạng thái chờ duyệt');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('voucher')
      .update({
        trang_thai: VoucherStatus.REJECTED,
      })
      .eq('ma_voucher', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      data,
      message: 'Đã từ chối voucher',
    };
  }

  async getBranches(maDT: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('chi_nhanh')
      .select('*')
      .eq('ma_dt', maDT);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      data,
    };
  }

  async uploadBanner(file: Express.Multer.File) {
    const fileName = Date.now() + '-' + file.originalname;

    const { error } = await this.supabaseService
      .getClient()
      .storage.from('voucher-banners')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const {
      data: { publicUrl },
    } = this.supabaseService
      .getClient()
      .storage.from('voucher-banners')
      .getPublicUrl(fileName);

    return {
      success: true,
      data: {
        bannerUrl: publicUrl,
      },
      message: 'Upload banner thành công',
    };
  }
}
