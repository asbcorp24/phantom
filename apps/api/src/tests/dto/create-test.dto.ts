import { IsInt,IsOptional,IsString,Max,Min,MinLength } from 'class-validator';
export class CreateTestDto {
 @IsString() @MinLength(2) title!:string;
 @IsInt() @Min(1) @Max(100) passingScore!:number;
 @IsOptional() @IsInt() @Min(1) timeLimitSec?:number;
 @IsOptional() @IsInt() @Min(1) maxAttempts?:number;
}
