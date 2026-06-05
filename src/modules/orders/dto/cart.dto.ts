import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho tính năng thêm sản phẩm (voucher) vào giỏ hàng
 */
export class AddToCartDto {
  @IsString({ message: 'Mã voucher phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã voucher không được để trống' })
  ma_voucher!: string;

  @IsOptional()
  @Type(() => Number) // Tự động ép kiểu sang Number đề phòng trường hợp client gửi string '2'
  @IsInt({ message: 'Số lượng mua phải là số nguyên' })
  @Min(1, { message: 'Số lượng mua tối thiểu là 1' })
  so_luong_mua: number = 1; // Gán giá trị mặc định là 1 nếu client không truyền
}

/**
 * DTO cho tính năng cập nhật (tăng/giảm) số lượng sản phẩm trong giỏ hàng
 */
export class UpdateCartItemQuantityDto {
  @IsNotEmpty({ message: 'Số lượng mua không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Số lượng mua phải là số nguyên' })
  @Min(1, { message: 'Số lượng mua tối thiểu là 1' })
  so_luong_mua!: number;
}