import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  TenVoucher!: string;

  @IsString()
  MaPL!: string;

  @IsString()
  MaTaxon!: string;

  @IsString()
  MoTa!: string;

  @IsString()
  MaDT!: string;

  @IsString()
  bannerUrl!: string;

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
