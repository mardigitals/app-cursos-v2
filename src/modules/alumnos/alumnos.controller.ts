import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  HttpCode,      
  HttpStatus,    
  NotFoundException 
} from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { Alumno } from './entities/alumno.entity'; 

@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) {}


  @Post()
  create(@Body() createAlumnoDto: CreateAlumnoDto): Promise<Alumno> { 
    return this.alumnosService.create(createAlumnoDto);
  }


  @Get()
  findAll(): Promise<Alumno[]> { 
    return this.alumnosService.findAll();
  }


  @Get(':legajo')
  findOne(@Param('legajo', ParseIntPipe) legajo: number): Promise<Alumno> {
    return this.alumnosService.findOne(legajo);
  }


  @Patch(':legajo')
  update(
    @Param('legajo', ParseIntPipe) legajo: number, 
    @Body() updateAlumnoDto: UpdateAlumnoDto
  ): Promise<Alumno> {
    return this.alumnosService.update(legajo, updateAlumnoDto);
  }


  @Delete(':legajo')
  @HttpCode(HttpStatus.NO_CONTENT) 
  remove(@Param('legajo', ParseIntPipe) legajo: number): Promise<void> {
    return this.alumnosService.remove(legajo).then(() => {}); 
  }


  @Patch(':legajo/reactivate')
  reactivate(@Param('legajo', ParseIntPipe) legajo: number): Promise<Alumno> {
    return this.alumnosService.reactivate(legajo);
  }
}