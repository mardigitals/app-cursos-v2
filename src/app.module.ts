import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Importa todos los módulos que contienen entidades:
import { AlumnosModule } from './modules/alumnos/alumnos.module';
import { CursosModule } from './modules/cursos/cursos.module';
import { ProfesoresModule } from './modules/profesores/profesores.module';
import { InscripcionesModule } from './modules/inscripciones/inscripciones.module';
import { NotasModule } from './modules/notas/notas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';


@Module({
  imports: [
    //  Configuración de Entorno
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a la Base de Datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true, 
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    //  Importación de TODOS los módulos de entidades:
    AlumnosModule,     
    CursosModule,      
    ProfesoresModule,  
    InscripcionesModule,
    NotasModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}