import { IsBoolean,IsOptional,IsString,MinLength } from 'class-validator';
export class CreateCourseDto {
 @IsString() @MinLength(2) title!:string;
 @IsOptional() @IsString() description?:string;
 @IsOptional() @IsBoolean() mandatory?:boolean;
}
