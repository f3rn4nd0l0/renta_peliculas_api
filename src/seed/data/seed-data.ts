export const seedData = {
  clientes: [
    {
      nombre: 'Admin Renta',
      correo: 'admin@renta.com',
      password: 'Admin123',
      roles: ['admin'],
    },
    {
      nombre: 'Fernando Cliente',
      correo: 'fernando@correo.com',
      password: 'Cliente123',
      roles: ['user'],
    },
    {
      nombre: 'Ana Cliente',
      correo: 'ana@correo.com',
      password: 'Cliente123',
      roles: ['user'],
    },
  ],
  peliculas: [
    { titulo: 'El Padrino', anioLanzamiento: 1972, precioRenta: 39.99 },
    { titulo: 'Pulp Fiction', anioLanzamiento: 1994, precioRenta: 34.99 },
    { titulo: 'Matrix', anioLanzamiento: 1999, precioRenta: 29.99 },
    { titulo: 'Interestelar', anioLanzamiento: 2014, precioRenta: 44.99 },
    { titulo: 'Coco', anioLanzamiento: 2017, precioRenta: 24.99 },
  ],
  copiasPorPelicula: 3,
};