import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentasService } from './rentas.service';
import { RentasController } from './rentas.controller';
import { Renta } from './entities/renta.entity';
import { AuthModule } from '../auth/auth.module';
import { PeliculasModule } from '../peliculas/peliculas.module';

@Module({
  controllers: [RentasController],
  providers: [RentasService],
  imports: [
    TypeOrmModule.forFeature([Renta]),
    AuthModule,
    PeliculasModule,
  ],
  exports: [TypeOrmModule],
})
export class RentasModule {}