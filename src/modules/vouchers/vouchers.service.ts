import { Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import { SupabaseService } from '../../supabase/supabase.service';
import { VoucherStatus } from './enums/voucher-status.enum';

// constructor (private readonly supabase: SupabaseService) {}

@Injectable()
export class VouchersService {
  private vouchers: any[] = [];
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
    const voucher = {
      MaVoucher: this.currentId++,
      ...dto,
      TrangThai: VoucherStatus.DRAFT,
      SoLuongDaBan: 0,  
     };

    // const {data, error} = await this.supabase.client
    //   .from('vouchers')
    //   .insert(voucher)
    //   .select();

    // if (error) {
    //   throw new BadRequestException(error.message);
    // };
     
    this.vouchers.push(voucher);
    console.log(this.vouchers);

    return {
      success: true,
      data: voucher,
      message: 'Tạo voucher thành công',
    };
  }

  getAllVouchers() {
    // const {data, error} = 
    // await this.supabase.client
    //   .from('vouchers')
    //   .select('*');

    // if (error) {
    //   throw new BadRequestException(error.message);
    // }

    return {
      success: true,
      data: this.vouchers,
    };
  }

  getVoucherbyID(id: string) {
    const voucher = this.vouchers.find(v => v.MaVoucher === parseInt(id));

    if (!voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    return {
      success: true,
      data: voucher,
    };
  }

  updateVoucher(id: string, payload: any) {
    const voucher = this.vouchers.find(v => v.MaVoucher === parseInt(id));
    if (!voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    } 

    Object.assign(voucher, payload);

    if (voucher.TrangThai === VoucherStatus.ACTIVE || voucher.TrangThai === VoucherStatus.REJECTED || voucher.TrangThai === VoucherStatus.SCHEDULED) {
      voucher.TrangThai = VoucherStatus.PENDING;
    }

    if (voucher.TrangThai === VoucherStatus.PENDING) {
      voucher.TrangThai = VoucherStatus.PENDING;
    } else if (voucher.TrangThai === VoucherStatus.DRAFT) {
      voucher.TrangThai = VoucherStatus.DRAFT;
    }

    return {
      success: true,
      data: voucher,
      message: 'Cập nhật voucher thành công',
    };
  }

  removeVoucher(id: string) {
    const index = this.vouchers.findIndex(v => v.MaVoucher === parseInt(id));   

    if (index === -1) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    this.vouchers.splice(index, 1);

    return {
      success: true,
      message: 'Xóa voucher thành công',
    };
  }

  submitVoucher (id: string) {
    const voucher = this.vouchers.find(v => v.MaVoucher === parseInt(id));

    if (!voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    if (voucher.TrangThai !== VoucherStatus.DRAFT) {
      throw new BadRequestException('Voucher không thể gửi duyệt');
    }

    voucher.TrangThai = VoucherStatus.PENDING;

    return {
      success: true,
      data: voucher,
      message: 'Gửi duyệt voucher thành công',
    };
  }

  searchVoucher(query: any) {
    let results = [...this.vouchers];

    // Lọc Tên Voucher
    if (query.TenVoucher) {
      results = results.filter(v => v.TenVoucher.toLowerCase().includes(query.TenVoucher.toLowerCase()));
    }

    // Lọc Trạng Thái
    if (query.TrangThai) {
      results = results.filter(v => v.TrangThai === query.TrangThai);
    }  

    // Lọc Giá Thấp nhất
    if (query.GiaMin) {
      results = results.filter(v => v.GiaBan >= query.GiaMin);
    }

    // Lọc Giá Cao nhất
    if (query.GiaMax) {
      results = results.filter(v => v.GiaBan <= query.GiaMax);
    }

    // Lọc Tỉ lệ Giảm Giá
    if (query.TiLeGiamMin) {
      results = results.filter(v => ((v.GiaGoc - v.GiaBan) / v.GiaGoc * 100) >= query.TiLeGiamMin);
    }

    // Lọc Chi nhánh
    if (query.ChiNhanh) {
      results = results.filter(v => v.ChiNhanhApDung?.includes(query.ChiNhanh));
    }

    return {
      success: true,
      total: results.length,
      data: results,
    };
  } 

  approveVoucher (id: string) {
    const voucher = this.vouchers.find(v => v.MaVoucher === parseInt(id));

    if (!voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    if (voucher.TrangThai !== VoucherStatus.PENDING) {
      throw new BadRequestException('Voucher không ở trạng thái chờ duyệt');
    }

    const now = new Date();
    if (voucher.NgayBD > now) {
      voucher.TrangThai = VoucherStatus.SCHEDULED;
    } else {
      voucher.TrangThai = VoucherStatus.ACTIVE;
    }

    return {
      success: true,
      data: voucher,
      message: 'Duyệt voucher thành công',
    };
  }

  rejectVoucher (id: string) {
    const voucher = this.vouchers.find(v => v.MaVoucher === parseInt(id));      

    if (!voucher) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    if (voucher.TrangThai !== VoucherStatus.PENDING) {
      throw new BadRequestException('Voucher không ở trạng thái chờ duyệt');
    }

    voucher.TrangThai = VoucherStatus.REJECTED;

    return {
      success: true,
      data: voucher,
      message: 'Đã từ chối voucher',
    };
  }
}
