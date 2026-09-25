import { IsArray,IsString,ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
class AnswerDto { @IsString() questionId!:string; @IsArray() @IsString({each:true}) optionIds!:string[]; }
export class SubmitAttemptDto { @IsArray() @ValidateNested({each:true}) @Type(()=>AnswerDto) answers!:AnswerDto[]; }
