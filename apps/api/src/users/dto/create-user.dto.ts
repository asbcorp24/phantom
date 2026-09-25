import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
 @IsEmail() email!: string;
 @IsString() @MinLength(2) firstName!: string;
 @IsString() @MinLength(2) lastName!: string;
 @IsOptional() @IsString() middleName?: string;
 @IsOptional() @IsString() position?: string;
 @IsOptional() @IsString() departmentId?: string;
 @IsEnum(UserRole) role!: UserRole;
 @IsString() @MinLength(8) password!: string;
}
