import { IsEmail, IsString, IsIn } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsIn(['customer', 'partner', 'admin', 'doi_tac', 'khach_hang'])
  role!: string;
}