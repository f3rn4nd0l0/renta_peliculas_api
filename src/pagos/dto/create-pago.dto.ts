import { IsIn, IsInt, IsPositive } from 'class-validator';
import type { MetodoPago } from '../entities/pago.entity';

export class CreatePagoDto {
  @IsInt()
  @IsPositive()
  rentaId!: number;

  @IsPositive()
  monto!: number;

  @IsIn(['efectivo', 'transferencia', 'tarjeta'])
  metodoPago!: MetodoPago;
}