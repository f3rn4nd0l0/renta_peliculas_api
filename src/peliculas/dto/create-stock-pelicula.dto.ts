import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';
import type { EstadoStock } from '../entities/stock-pelicula.entity';

export class CreateStockPeliculaDto {
  @IsInt()
  @IsPositive()
  peliculaId!: number;

  @IsOptional()
  @IsIn(['disponible', 'rentado', 'perdido'])
  estado?: EstadoStock;
}