import { IsBoolean,IsIn,IsOptional,IsString,MinLength } from 'class-validator';
export class CreateMaterialDto {
 @IsString() @MinLength(2) title!:string;
 @IsIn(['TEXT','PDF','VIDEO','IMAGE']) type!:string;
 @IsOptional() @IsString() content?:string;
 @IsOptional() @IsString() filePath?:string;
 @IsOptional() @IsBoolean() required?:boolean;
}
