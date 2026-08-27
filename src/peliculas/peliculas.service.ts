import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { isInt } from 'class-validator';

import { Pelicula } from './entities/pelicula.entity';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { PaginationDto } from '../common/dtos/pagination.dtos';

@Injectable()
export class PeliculasService {
  private readonly logger = new Logger('PeliculasService');

  constructor(
    @InjectRepository(Pelicula)
    private readonly peliculaRepository: Repository<Pelicula>,
  ) {}

  async create(createPeliculaDto: CreatePeliculaDto) {
    try {
      const pelicula = this.peliculaRepository.create(createPeliculaDto);
      await this.peliculaRepository.save(pelicula);
      return pelicula;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.peliculaRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let pelicula: Pelicula | null;

    if (isInt(Number(term))) {
      pelicula = await this.peliculaRepository.findOneBy({ id: Number(term) });
    } else {
      pelicula = await this.peliculaRepository.findOneBy({ slug: term });
    }

    if (!pelicula)
      throw new NotFoundException(`Película con "${term}" no encontrada`);

    return pelicula;
  }

  async update(id: number, updatePeliculaDto: UpdatePeliculaDto) {
    const pelicula = await this.peliculaRepository.preload({
      id,
      ...updatePeliculaDto,
    });

    if (!pelicula)
      throw new NotFoundException(`Película con id ${id} no encontrada`);

    try {
      await this.peliculaRepository.save(pelicula);
      return pelicula;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    const pelicula = await this.findOne(String(id));
    await this.peliculaRepository.remove(pelicula);
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