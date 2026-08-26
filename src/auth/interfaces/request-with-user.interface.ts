import { Request } from 'express';
import { Cliente } from '../entities/cliente.entity';

export interface RequestWithUser extends Request {
  user: Cliente;
}