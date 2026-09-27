import { IsDateString,IsOptional,IsString } from 'class-validator';
export class CreateGroupAssignmentDto {
 @IsString() groupId!:string;
 @IsString() courseId!:string;
 @IsOptional() @IsDateString() dueAt?:string;
}
