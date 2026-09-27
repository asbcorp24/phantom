import { IsEnum,IsOptional,IsString,MinLength } from 'class-validator';
import { UserRole,UserStatus } from '@prisma/client';
export class UpdateUserDto {
 @IsOptional() @IsString() @MinLength(1) firstName?:string;
 @IsOptional() @IsString() @MinLength(1) lastName?:string;
 @IsOptional() @IsString() middleName?:string;
 @IsOptional() @IsString() position?:string;
 @IsOptional() @IsString() departmentId?:string;
 @IsOptional() @IsEnum(UserRole) role?:UserRole;
 @IsOptional() @IsEnum(UserStatus) status?:UserStatus;
}
