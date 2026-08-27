import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { StockPelicula } from './entities/stock-pelicula.entity';
import { Pelicula } from './entities/pelicula.entity';
import { CreateStockPeliculaDto } from './dto/create-stock-pelicula.dto';
import { PaginationDto } from '../common/dtos/pagination.dtos';

@Injectable()
export class StockPeliculasService {
  private readonly logger = new Logger('StockPeliculasService');

  constructor(
    @InjectRepository(StockPelicula)
    private readonly stockRepository: Repository<StockPelicula>,
    @InjectRepository(Pelicula)
    private readonly peliculaRepository: Repository<Pelicula>,
  ) {}

  async create(createStockPeliculaDto: CreateStockPeliculaDto) {
    const { peliculaId, estado } = createStockPeliculaDto;

    const pelicula = await this.peliculaRepository.findOneBy({ id: peliculaId });
    if (!pelicula)
      throw new NotFoundException(`Película con id ${peliculaId} no encontrada`);

    try {
      const stock = this.stockRepository.create({
        pelicula,
        estado: estado ?? 'disponible',
      });
      await this.stockRepository.save(stock);
      return stock;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto, peliculaId?: number) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.stockRepository.find({
      take: limit,
      skip: offset,
      where: peliculaId ? { pelicula: { id: peliculaId } } : {},
    });
  }

  async remove(id: number) {
    const stock = await this.stockRepository.findOneBy({ id });
    if (!stock)
      throw new NotFoundException(`Ejemplar con id ${id} no encontrado`);

    if (stock.estado === 'rentado')
      throw new BadRequestException(
        'No se puede eliminar un ejemplar que está rentado actualmente',
      );

    await this.stockRepository.remove(stock);
  }

  private handleDBExceptions(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as {
        errno?: number;
        sqlMessage?: string;
      };
      if (driverError.errno === 1062) {
        throw new BadRequestException(driverError.sqlMessage);
      }
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}