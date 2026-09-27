import { IsString,MinLength } from 'class-validator';
export class RevokeCertificateDto {
 @IsString() @MinLength(3) reason!:string;
}
