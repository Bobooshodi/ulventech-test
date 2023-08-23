import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  public firstName: string;

  @IsNotEmpty()
  @IsString()
  public lastName: string;

  @IsOptional()
  @IsString()
  public otherNames: string;

  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsDate()
  public dateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  public gender: string;
}
