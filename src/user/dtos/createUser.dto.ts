/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsAlpha, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsAlpha()
  @IsNotEmpty()
  password: string;
}
