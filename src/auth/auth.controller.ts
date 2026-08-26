import { Body, Controller, Get, Post, Req, UseGuards, Headers  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './decorators/role-protected.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { Cliente } from './entities/cliente.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { RawHeaders } from './decorators';
import type { IncomingHttpHeaders } from 'http';


@Controller('auth')
export class AuthController {
      // Inyecta AuthService para poder usar sus métodos en los endpoints de este controlador.
  constructor(private readonly authService: AuthService) {}

  // Ruta pública: cualquiera puede registrarse.
  @Post('register')
  createUser(@Body() createClienteDto: CreateClienteDto) {
    return this.authService.create(createClienteDto);
  }

  // Ruta pública: verifica credenciales y devuelve el usuario + token.
  @Post('login')
  loginUser(@Body() loginClienteDto: LoginClienteDto) {
    return this.authService.login(loginClienteDto);
  }

  // @Auth() sin roles: solo exige estar autenticado (cualquier rol).
  // Permite "renovar" el token sin volver a enviar la contraseña.
  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() cliente: Cliente) {
    return this.authService.checkAuthStatus(cliente);
  }

  // Ejemplo didáctico de ruta protegida "a mano", sin el decorador @Auth().
  // Muestra distintas formas de extraer información de la petición.
  @Get('private')
  // @UseGuards(AuthGuard(), UserRoleGuard) // AuthGuard() verifica el token JWT, UserRoleGuard verifica los roles.
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() cliente: Cliente,
    @GetUser('correo') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      cliente,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  // Ejemplo didáctico: muestra los DOS decoradores que @Auth() combina
  // internamente, usados aquí por separado en vez de con el atajo @Auth(...).
  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  // @RoleProtected(...) guarda los roles permitidos como metadata en la ruta,
  // para que UserRoleGuard pueda leerlos después con Reflector.
  //Se usa AuthGuard() para verificar el token JWT y UserRoleGuard para verificar los roles.
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() cliente: Cliente) {
    return {
      ok: true,
      cliente,
    };
  }

  // Versión final, simplificada: @Auth(ValidRoles.admin) hace exactamente
  // lo mismo que /private2, en una sola línea.
  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(@GetUser() cliente: Cliente) {
    return {
      ok: true,
      cliente,
    };
  }
}
