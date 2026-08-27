import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreateRentaDto {
  @IsInt()
  @IsPositive()
  peliculaId!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  diasRenta?: number;
}