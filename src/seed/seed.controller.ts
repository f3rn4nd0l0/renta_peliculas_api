import { Controller, Get } from '@nestjs/common';

import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  // Un único endpoint, pensado solo para desarrollo: borra todo lo que haya
  // en las tablas de usuarios y productos, y las vuelve a llenar con los
  // datos de initialData (seed-data.ts).
  @Get()
  executeSeed() {
    return this.seedService.runSeed();
  }
}
