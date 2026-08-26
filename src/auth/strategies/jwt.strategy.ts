import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Cliente } from '../entities/cliente.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET')!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: JwtPayload): Promise<Cliente> {
    const { id } = payload;
    const cliente = await this.clienteRepository.findOneBy({ id });
    if (!cliente) throw new UnauthorizedException('Token not valid');
    if (!cliente.isActive)
      throw new UnauthorizedException('Cliente is inactive, talk with an admin');
    return cliente;
  }
}