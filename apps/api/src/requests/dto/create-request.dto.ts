import { IsString,MinLength } from 'class-validator';
export class CreateRequestDto { @IsString() @MinLength(3) subject!:string; @IsString() @MinLength(1) message!:string; }
