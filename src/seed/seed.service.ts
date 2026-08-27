import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Cliente } from '../auth/entities/cliente.entity';
import { Pelicula } from '../peliculas/entities/pelicula.entity';
import { StockPelicula } from '../peliculas/entities/stock-pelicula.entity';
import { Renta } from '../rentas/entities/renta.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { seedData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Pelicula)
    private readonly peliculaRepository: Repository<Pelicula>,
    @InjectRepository(StockPelicula)
    private readonly stockRepository: Repository<StockPelicula>,
    @InjectRepository(Renta)
    private readonly rentaRepository: Repository<Renta>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    await this.insertClientes();
    await this.insertPeliculasConStock();
    return 'SEED EJECUTADO';
  }

  private async deleteTables() {
    await this.pagoRepository.createQueryBuilder().delete().execute();
    await this.rentaRepository.createQueryBuilder().delete().execute();
    await this.stockRepository.createQueryBuilder().delete().execute();
    await this.peliculaRepository.createQueryBuilder().delete().execute();
    await this.clienteRepository.createQueryBuilder().delete().execute();
  }

  private async insertClientes() {
    const clientes = seedData.clientes.map((c) =>
      this.clienteRepository.create({
        ...c,
        password: bcrypt.hashSync(c.password, 10),
      }),
    );
    await this.clienteRepository.save(clientes);
  }

  private async insertPeliculasConStock() {
    for (const p of seedData.peliculas) {
      const pelicula = this.peliculaRepository.create(p);
      await this.peliculaRepository.save(pelicula);

      const copias = Array.from(
        { length: seedData.copiasPorPelicula },
        () => this.stockRepository.create({ pelicula, estado: 'disponible' }),
      );
      await this.stockRepository.save(copias);
    }
  }
}