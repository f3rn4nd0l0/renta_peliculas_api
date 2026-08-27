import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeliculasService } from './peliculas.service';
import { PeliculasController } from './peliculas.controller';
import { StockPeliculasService } from './stock-peliculas.service';
import { StockPeliculasController } from './stock-peliculas.controller';
import { Pelicula } from './entities/pelicula.entity';
import { StockPelicula } from './entities/stock-pelicula.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PeliculasController, StockPeliculasController],
  providers: [PeliculasService, StockPeliculasService],
  imports: [TypeOrmModule.forFeature([Pelicula, StockPelicula]), AuthModule],
  exports: [TypeOrmModule],
})
export class PeliculasModule {}
