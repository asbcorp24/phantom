import { IsString } from 'class-validator';
export class ReassignRequestDto { @IsString() curatorId!:string; }
