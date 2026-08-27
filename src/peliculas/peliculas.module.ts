import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeliculasService } from './peliculas.service';
import { PeliculasController } from './peliculas.controller';
import { Pelicula } from './entities/pelicula.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PeliculasController],
  providers: [PeliculasService],
  imports: [TypeOrmModule.forFeature([Pelicula]), AuthModule],
  exports: [TypeOrmModule],
})
export class PeliculasModule {}
