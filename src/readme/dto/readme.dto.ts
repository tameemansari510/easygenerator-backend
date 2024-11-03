import { IsString } from 'class-validator';

export class ReadmeDto {
  @IsString()
  content: string;
}
