import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { Renta } from './entities/renta.entity';
import { StockPelicula } from '../peliculas/entities/stock-pelicula.entity';
import { Cliente } from '../auth/entities/cliente.entity';
import { CreateRentaDto } from './dto/create-renta.dto';
import { PaginationDto } from '../common/dtos/pagination.dtos';

const DIAS_RENTA_DEFAULT = 7;
const COSTO_MORA_POR_DIA = 10;

@Injectable()
export class RentasService {
  private readonly logger = new Logger('RentasService');

  constructor(
    @InjectRepository(Renta)
    private readonly rentaRepository: Repository<Renta>,
    @InjectRepository(StockPelicula)
    private readonly stockRepository: Repository<StockPelicula>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createRentaDto: CreateRentaDto, cliente: Cliente) {
    const { peliculaId, diasRenta = DIAS_RENTA_DEFAULT } = createRentaDto;

    const stockDisponible = await this.stockRepository.findOne({
      where: { pelicula: { id: peliculaId }, estado: 'disponible' },
    });

    if (!stockDisponible)
      throw new BadRequestException(
        `No hay ejemplares disponibles para la película con id ${peliculaId}`,
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      stockDisponible.estado = 'rentado';
      await queryRunner.manager.save(stockDisponible);

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + diasRenta);

      const renta = this.rentaRepository.create({
        cliente,
        stockPelicula: stockDisponible,
        fechaLimite,
      });
      await queryRunner.manager.save(renta);

      await queryRunner.commitTransaction();
      return renta;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.rentaRepository.find({ take: limit, skip: offset });
  }

  async misRentas(cliente: Cliente, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.rentaRepository.find({
      where: { cliente: { id: cliente.id } },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: number) {
    const renta = await this.rentaRepository.findOneBy({ id });
    if (!renta)
      throw new NotFoundException(`Renta con id ${id} no encontrada`);
    return renta;
  }

  async devolver(id: number) {
    const renta = await this.findOne(id);

    if (renta.estado === 'devuelta')
      throw new BadRequestException('Esta renta ya fue devuelta');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ahora = new Date();
      renta.fechaDevolucion = ahora;
      renta.estado = 'devuelta';

      if (ahora > renta.fechaLimite) {
        const diasAtraso = Math.ceil(
          (ahora.getTime() - renta.fechaLimite.getTime()) / 86400000,
        );
        renta.demora = diasAtraso * COSTO_MORA_POR_DIA;
      }

      await queryRunner.manager.save(renta);

      renta.stockPelicula.estado = 'disponible';
      await queryRunner.manager.save(renta.stockPelicula);

      await queryRunner.commitTransaction();
      return renta;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
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

  async procesarVencidas(diasUmbral: number) {
  await this.dataSource.query(
    'CALL sp_procesar_rentas_vencidas(?, @procesadas, @omitidas)',
    [diasUmbral],
  );

  const [resultado] = await this.dataSource.query(
    'SELECT @procesadas AS procesadas, @omitidas AS omitidas',
  );

  return {
    procesadas: Number(resultado.procesadas),
    omitidas: Number(resultado.omitidas),
    mensaje: `Se procesaron ${resultado.procesadas} rentas vencidas (umbral: ${diasUmbral} días), ${resultado.omitidas} omitidas.`,
  };
}

}