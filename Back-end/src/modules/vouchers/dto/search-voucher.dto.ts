import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class SearchVoucherDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  ma_taxon?: string;

  @IsString()
  @IsOptional()
  ma_dt?: string;

  @IsString()
  @IsOptional()
  ma_cn?: string;

  @IsNumberString()
  @IsOptional()
  gia_min?: string;

  @IsNumberString()
  @IsOptional()
  gia_max?: string;

  @IsNumberString()
  @IsOptional()
  giam_min?: string;

  @IsString()
  @IsOptional()
  hieu_luc?: string;

  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;
}
