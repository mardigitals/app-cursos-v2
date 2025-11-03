import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 


async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Ignora cualquier campo que no esté definido en el DTO
      forbidNonWhitelisted: true, // Lanza un error si se envía un campo extra
      transform: true, // Usa class-transformer para transformar payloads a instancias de DTO
  }));

  app.enableCors({
    origin:'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
