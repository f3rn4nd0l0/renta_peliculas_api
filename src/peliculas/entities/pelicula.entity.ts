import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('peliculas')
export class Pelicula {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { 
    length: 150 })
  titulo!: string;

  @Column('int', { 
    name: 'anio_lanzamiento' })
  anioLanzamiento!: number;

  @Column('decimal', { 
    name: 'precio_renta', 
    precision: 6, 
    scale: 2 })
  precioRenta!: number;

  @Column('varchar', { 
    length: 300, 
    unique: true })
  slug!: string;

  @BeforeInsert()
  @BeforeUpdate()
  generarSlug() {
    if (!this.slug) {
      this.slug = this.titulo;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}