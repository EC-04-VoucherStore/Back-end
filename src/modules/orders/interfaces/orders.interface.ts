export enum PhuongThucThanhToan {
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  VNPAY = 'VNPAY',
  CHUYEN_KHOAN = 'CHUYEN_KHOAN',
}

export enum TrangThaiThanhToan {
  CHO_THANH_TOAN = 'CHO_THANH_TOAN',
  DA_THANH_TOAN = 'DA_THANH_TOAN',
  DANG_XU_LY = 'DANG_XU_LY',
  THAT_BAI = 'THAT_BAI',
  DA_HOAN_TIEN = 'DA_HOAN_TIEN',
}

// 1. CHI TIẾT GIỎ HÀNG (chi_tiet_gio_hang)
export interface ICartItem {
  ma_ctgh: string;
  ma_kh: string;
  ma_voucher: string;
  so_luong_mua: number; // Mặc định là 1 trong DB
}

// 2. ĐƠN HÀNG (don_hang)
export interface IOrder {
  ma_dh: string;
  ma_kh: string;
  ten_don_hang?: string; // Tùy chọn vì DB không có NOT NULL
  tong_tien: number;
  phuong_thuc_thanh_toan?: PhuongThucThanhToan | string;
  trang_thai_thanh_toan?: TrangThaiThanhToan | string;
  ngay_tao_don: Date | string; // Supabase thường trả về ISO string
}

// 3. CHI TIẾT ĐƠN HÀNG (chi_tiet_don_hang)
export interface IOrderDetail {
  ma_ctdh: string;
  ma_dh: string;
  ma_voucher: string;
  so_luong_mua: number;
  don_gia_mua: number;
}

// 4. LỊCH SỬ GIAO DỊCH (lich_su_giao_dich)
export interface ITransactionHistory {
  ma_ls: string;
  ma_dh: string;
  so_tien: number;
  phuong_thuc_thanh_toan?: PhuongThucThanhToan | string;
  trang_thai_thanh_toan?: TrangThaiThanhToan | string;
  ma_giao_dich_cung_cap?: string; // Mã giao dịch từ đối tác (VD: Mã GD của MoMo)
  ma_loi?: string; // Lưu mã lỗi nếu giao dịch thất bại
  thoi_gian_thuc_hien: Date | string; // Đã cập nhật đúng tên cột
}