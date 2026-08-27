import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

export class CreatePeliculaDto {
  @IsString()
  @MinLength(1)
  titulo!: string;

  @IsInt()
  @IsPositive()
  anioLanzamiento!: number;

  @IsPositive()
  precioRenta!: number;
}