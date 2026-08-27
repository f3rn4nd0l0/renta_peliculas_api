import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Pelicula } from './pelicula.entity';

export type EstadoStock = 'disponible' | 'rentado' | 'perdido';

@Entity('stock_peliculas')
export class StockPelicula {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('enum', { enum: ['disponible', 'rentado', 'perdido'] })
  estado!: EstadoStock;

  @ManyToOne(() => Pelicula, { eager: true })
  @JoinColumn({ name: 'pelicula_id' })
  pelicula!: Pelicula;
}