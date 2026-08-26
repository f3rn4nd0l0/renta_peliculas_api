import {createParamDecorator, ExecutionContext, InternalServerErrorException,
} from '@nestjs/common';
import { RequestWithUser } from '../interfaces/index';

// Unión explícita de las claves de User se pide desde
// @GetUser('...'): los campos de datos reales. Se escribe a mano
// para NO tener que evaluar 'product' (la relación circular
// con Product) al construir el tipo. Si agregas un campo
// nuevo a User y quieres poder pedirlo con @GetUser(), hay que acordarse de
// sumarlo aquí también — pero a cambio, el tipo es simple, predecible, y no
// depende de cómo esté relacionada User con el resto de las entidades.
type ClienteDataKey = 'id' | 'nombre' | 'correo' | 'isActive' | 'roles';


export const GetUser = createParamDecorator(

  (data: ClienteDataKey | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;


    if (!user)
      throw new InternalServerErrorException('Cliente no encontrado (request)');
    return !data ? user : user[data];
  },
);
