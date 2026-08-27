import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Pago } from './entities/pago.entity';
import { Renta } from '../rentas/entities/renta.entity';
import { Cliente } from '../auth/entities/cliente.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { PaginationDto } from '../common/dtos/pagination.dtos';

@Injectable()
export class PagosService {
  private readonly logger = new Logger('PagosService');

  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Renta)
    private readonly rentaRepository: Repository<Renta>,
  ) {}

  async create(createPagoDto: CreatePagoDto) {
    const { rentaId, monto, metodoPago } = createPagoDto;

    const renta = await this.rentaRepository.findOneBy({ id: rentaId });
    if (!renta)
      throw new NotFoundException(`Renta con id ${rentaId} no encontrada`);

    try {
      const pago = this.pagoRepository.create({ renta, monto, metodoPago });
      await this.pagoRepository.save(pago);
      return pago;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pagoRepository.find({ take: limit, skip: offset });
  }

  async misPagos(cliente: Cliente, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pagoRepository.find({
      where: { renta: { cliente: { id: cliente.id } } },
      take: limit,
      skip: offset,
    });
  }

  async findByRenta(rentaId: number) {
    return this.pagoRepository.find({ where: { renta: { id: rentaId } } });
  }

  async findOne(id: number) {
    const pago = await this.pagoRepository.findOneBy({ id });
    if (!pago) throw new NotFoundException(`Pago con id ${id} no encontrado`);
    return pago;
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