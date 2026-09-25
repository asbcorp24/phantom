import { IsArray,IsBoolean,IsString,MinLength,ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
class OptionDto { @IsString() @MinLength(1) text!:string; @IsBoolean() correct!:boolean; }
export class CreateQuestionDto {
 @IsString() @MinLength(2) text!:string;
 @IsBoolean() multiple!:boolean;
 @IsArray() @ValidateNested({each:true}) @Type(()=>OptionDto) options!:OptionDto[];
}
