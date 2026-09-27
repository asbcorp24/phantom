import { IsOptional,IsString,MinLength } from 'class-validator';
export class MessageDto {
 @IsString() @MinLength(1) text!:string;
 @IsOptional() @IsString() clientMessageId?:string;
}
