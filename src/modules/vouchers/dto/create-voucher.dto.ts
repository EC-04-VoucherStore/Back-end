import {
  IsDateString,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateVoucherDto {

  @IsString()
  TenVoucher!: string;

  @IsString()
  MoTa!: string;

  @IsNumber()
  GiaGoc!: number;

  @IsNumber()
  GiaBan!: number;

  @IsNumber()
  SoLuongPhatHanh!: number;

  @IsDateString()
  NgayBD!: Date;

  @IsDateString()
  NgayKT!: Date;
}
