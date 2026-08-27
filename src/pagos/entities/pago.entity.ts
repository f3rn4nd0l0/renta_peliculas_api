import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Renta } from '../../rentas/entities/renta.entity';

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Renta, { eager: true })
  @JoinColumn({ 
    name: 'renta_id' })
  renta!: Renta;

  @Column('decimal', { 
    precision: 6, 
    scale: 2 })
  monto!: number;

  @Column('timestamp', { 
    name: 'fecha_pago' })
  fechaPago!: Date;

  @Column('enum', { 
    name: 'metodo_pago', 
    enum: ['efectivo', 'transferencia', 'tarjeta'] })
  metodoPago!: MetodoPago;
}