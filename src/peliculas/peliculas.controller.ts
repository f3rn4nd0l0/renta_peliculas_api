import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PeliculasService } from './peliculas.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { PaginationDto } from '../common/dtos/pagination.dtos';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';

@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createPeliculaDto: CreatePeliculaDto) {
    return this.peliculasService.create(createPeliculaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.peliculasService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.peliculasService.findOne(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeliculaDto: UpdatePeliculaDto,
  ) {
    return this.peliculasService.update(id, updatePeliculaDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.peliculasService.remove(id);
  }
}