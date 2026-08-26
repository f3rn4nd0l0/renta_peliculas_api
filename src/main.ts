import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

 
  async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      // Elimina del objeto recibido cualquier propiedad que no esté
      // declarada en el DTO correspondiente.
      whitelist: true,
      // En vez de solo eliminar esas propiedades extra, lanza un error 400
      // si el cliente las envía.
      forbidNonWhitelisted: true,
    }),
  );

  // Escucha en el puerto definido por la variable de entorno PORT, o en el
  // 3000 si no existe.
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
