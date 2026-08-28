import { IsInt, IsOptional, Min } from 'class-validator';

export class ProcesarVencidasDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  diasUmbral?: number;
}