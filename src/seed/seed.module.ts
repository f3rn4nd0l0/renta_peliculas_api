import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AuthModule } from '../auth/auth.module';
import { PeliculasModule } from '../peliculas/peliculas.module';
import { RentasModule } from '../rentas/rentas.module';
import { PagosModule } from '../pagos/pagos.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [AuthModule, PeliculasModule, RentasModule, PagosModule],
})
export class SeedModule {}
