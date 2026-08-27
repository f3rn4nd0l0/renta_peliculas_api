import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { StockPeliculasService } from './stock-peliculas.service';
import { CreateStockPeliculaDto } from './dto/create-stock-pelicula.dto';
import { PaginationDto } from '../common/dtos/pagination.dtos';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';

@Controller('stock-peliculas')
export class StockPeliculasController {
  constructor(private readonly stockPeliculasService: StockPeliculasService) {}

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createStockPeliculaDto: CreateStockPeliculaDto) {
    return this.stockPeliculasService.create(createStockPeliculaDto);
  }

  @Get()
  @Auth(ValidRoles.admin)
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('peliculaId') peliculaId?: string,
  ) {
    return this.stockPeliculasService.findAll(
      paginationDto,
      peliculaId ? Number(peliculaId) : undefined,
    );
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockPeliculasService.remove(id);
  }
}