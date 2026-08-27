import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '../../auth/entities/cliente.entity';
import { StockPelicula } from '../../peliculas/entities/stock-pelicula.entity';

export type EstadoRenta = 'activa' | 'devuelta' | 'atrasada' | 'perdida';

@Entity('rentas')
export class Renta {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Cliente, { eager: true })
  @JoinColumn({ 
    name: 'cliente_id' })
  cliente!: Cliente;

  @ManyToOne(() => StockPelicula, { eager: true })
  @JoinColumn({ name: 'stock_pelicula_id' })
  stockPelicula!: StockPelicula;

  @Column('datetime', { 
    name: 'fecha_renta' })
  fechaRenta!: Date;

  @Column('datetime', { 
    name: 'fecha_limite' })
  fechaLimite!: Date;

  @Column('datetime', { 
    name: 'fecha_devolucion', 
    nullable: true })
  fechaDevolucion!: Date | null;

  @Column('decimal', { 
    precision: 6, 
    scale: 2, 
    default: 0.0 })
  demora!: number;

  @Column('enum', {
    enum: ['activa', 'devuelta', 'atrasada', 'perdida'],
    default: 'activa',
  })
  estado!: EstadoRenta;
}