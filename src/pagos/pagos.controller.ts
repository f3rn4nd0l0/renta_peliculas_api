import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { PaginationDto } from '../common/dtos/pagination.dtos';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Cliente } from '../auth/entities/cliente.entity';
import { ValidRoles } from '../auth/interfaces';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.create(createPagoDto);
  }

  @Get()
  @Auth(ValidRoles.admin)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.pagosService.findAll(paginationDto);
  }

  @Get('mis-pagos')
  @Auth()
  misPagos(@GetUser() cliente: Cliente, @Query() paginationDto: PaginationDto) {
    return this.pagosService.misPagos(cliente, paginationDto);
  }

  @Get('renta/:rentaId')
  @Auth(ValidRoles.admin)
  findByRenta(@Param('rentaId', ParseIntPipe) rentaId: number) {
    return this.pagosService.findByRenta(rentaId);
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.findOne(id);
  }
}