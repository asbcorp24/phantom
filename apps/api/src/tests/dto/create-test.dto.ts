import { IsInt,IsOptional,IsString,Min,MinLength } from 'class-validator';
export class CreateTestDto {
 @IsString() @MinLength(2) title!:string;
 @IsInt() @Min(1) passingScore!:number;
 @IsOptional() @IsInt() @Min(1) timeLimitSec?:number;
 @IsOptional() @IsInt() @Min(1) maxAttempts?:number;
}
