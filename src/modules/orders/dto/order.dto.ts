import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  Min, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  ValidateNested, 
  IsNumber, 
  ArrayNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { PhuongThucThanhToan, TrangThaiThanhToan } from '../interfaces/orders.interface';

// ==============================================================================
// 1. DTO TẠO ĐƠN HÀNG (CREATE ORDER)
// ==============================================================================

/**
 * DTO đại diện cho từng sản phẩm (voucher) nằm bên trong đơn hàng
 */
export class OrderItemDto {
  @IsString({ message: 'Mã voucher phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã voucher không được để trống' })
  ma_voucher!: string;

  @Type(() => Number)
  @IsInt({ message: 'Số lượng mua phải là số nguyên' })
  @Min(1, { message: 'Số lượng mua tối thiểu là 1' })
  so_luong_mua: number = 1;

  // LƯU Ý: Không cho phép client gửi `don_gia_mua` lên để bảo mật. 
  // Backend sẽ tự query DB để lấy giá bán thực tế của voucher.
}

/**
 * DTO chính để client gọi API tạo đơn hàng
 */
export class CreateOrderDto {
  @IsOptional()
  @IsString({ message: 'Tên đơn hàng phải là chuỗi ký tự' })
  ten_don_hang?: string;

  @IsEnum(PhuongThucThanhToan, { message: 'Phương thức thanh toán không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng chọn phương thức thanh toán' })
  phuong_thuc_thanh_toan!: PhuongThucThanhToan;

  @IsArray({ message: 'Danh sách sản phẩm phải là một mảng' })
  @ArrayNotEmpty({ message: 'Đơn hàng phải có ít nhất 1 sản phẩm' })
  @ValidateNested({ each: true }) // Kích hoạt validate cho từng phần tử trong mảng
  @Type(() => OrderItemDto)       // Chỉ định kiểu dữ liệu của phần tử để class-transformer map đúng
  items!: OrderItemDto[];
}


// ==============================================================================
// 2. DTO LƯU LỊCH SỬ GIAO DỊCH (TRANSACTION HISTORY)
// ==============================================================================

/**
 * DTO này thường được sử dụng khi nhận Callback/Webhook từ cổng thanh toán (MoMo, ZaloPay...)
 * hoặc dùng nội bộ trong Service để insert log giao dịch.
 */
export class CreateTransactionHistoryDto {
  @IsString({ message: 'Mã đơn hàng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã đơn hàng không được để trống' })
  ma_dh!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Số tiền phải là số hợp lệ' })
  @Min(0, { message: 'Số tiền không được âm' })
  so_tien!: number;

  @IsOptional()
  @IsEnum(PhuongThucThanhToan, { message: 'Phương thức thanh toán không hợp lệ' })
  phuong_thuc_thanh_toan?: PhuongThucThanhToan;

  @IsOptional()
  @IsEnum(TrangThaiThanhToan, { message: 'Trạng thái thanh toán không hợp lệ' })
  trang_thai_thanh_toan?: TrangThaiThanhToan;

  @IsOptional()
  @IsString({ message: 'Mã giao dịch cung cấp phải là chuỗi ký tự' })
  ma_giao_dich_cung_cap?: string;

  @IsOptional()
  @IsString({ message: 'Mã lỗi phải là chuỗi ký tự' })
  ma_loi?: string;
}