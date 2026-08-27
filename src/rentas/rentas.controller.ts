import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { RentasService } from './rentas.service';
import { CreateRentaDto } from './dto/create-renta.dto';
import { PaginationDto } from '../common/dtos/pagination.dtos';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Cliente } from '../auth/entities/cliente.entity';
import { ValidRoles } from '../auth/interfaces';

@Controller('rentas')
export class RentasController {
  constructor(private readonly rentasService: RentasService) {}

  @Post()
  @Auth()
  create(@Body() createRentaDto: CreateRentaDto, @GetUser() cliente: Cliente) {
    return this.rentasService.create(createRentaDto, cliente);
  }

  @Get()
  @Auth(ValidRoles.admin)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.rentasService.findAll(paginationDto);
  }

  @Get('mis-rentas')
  @Auth()
  misRentas(
    @GetUser() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.rentasService.misRentas(cliente, paginationDto);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rentasService.findOne(id);
  }

  @Patch(':id/devolver')
  @Auth(ValidRoles.admin)
  devolver(@Param('id', ParseIntPipe) id: number) {
    return this.rentasService.devolver(id);
  }
}