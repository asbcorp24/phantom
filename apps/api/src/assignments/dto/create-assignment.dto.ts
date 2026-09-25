import { IsDateString,IsOptional,IsString } from 'class-validator';
export class CreateAssignmentDto {
 @IsString() userId!:string;
 @IsString() courseId!:string;
 @IsOptional() @IsDateString() dueAt?:string;
}
