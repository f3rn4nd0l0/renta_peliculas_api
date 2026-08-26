import {BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException,} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { Cliente } from './entities/cliente.entity';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createClienteDto: CreateClienteDto) {
    try {
      const { password, ...clienteData } = createClienteDto;
      const cliente = this.clienteRepository.create({
        ...clienteData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.clienteRepository.save(cliente);

      const { password: _, ...clienteSinPassword } = cliente;
      return {
        ...clienteSinPassword,
        token: this.getJwtToken({ id: cliente.id }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginClienteDto: LoginClienteDto) {
    const { password, correo } = loginClienteDto;

    const cliente = await this.clienteRepository.findOne({
      where: { correo },
      select: { correo: true, password: true, id: true },
    });

    if (!cliente)
      throw new UnauthorizedException('Credenciales no válidas (correo)');

    if (!bcrypt.compareSync(password, cliente.password))
      throw new UnauthorizedException('Credenciales no válidas (contraseña)');

    const { password: _, ...clienteSinPassword } = cliente;
    return {
      ...clienteSinPassword,
      token: this.getJwtToken({ id: cliente.id }),
    };
  }

  checkAuthStatus(cliente: Cliente) {
    return {
      ...cliente,
      token: this.getJwtToken({ id: cliente.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
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