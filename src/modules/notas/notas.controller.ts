import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { NotasService } from './notas.service';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { Nota } from './entities/nota.entity';

@Controller('notas')
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  // POST /notas
  @Post()
  create(@Body() createDto: CreateNotaDto): Promise<Nota> {
    return this.notasService.create(createDto);
  }

  // GET /notas
  @Get()
  findAll(): Promise<Nota[]> {
    return this.notasService.findAll();
  }

  // GET /notas/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Nota> {
    return this.notasService.findOne(id);
  }

  // PATCH /notas/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDto: UpdateNotaDto
  ): Promise<Nota> {
    return this.notasService.update(id, updateDto);
  }

  // DELETE /notas/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.notasService.remove(id);
  }
}
