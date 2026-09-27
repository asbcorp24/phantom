import { IsEnum,IsInt,IsString,Max,Min,MinLength } from 'class-validator';
import { AttemptStatus } from '@prisma/client';
export class ChangeAttemptResultDto {
 @IsEnum(AttemptStatus) status!:AttemptStatus;
 @IsInt() @Min(0) @Max(100) score!:number;
 @IsString() @MinLength(3) reason!:string;
}
