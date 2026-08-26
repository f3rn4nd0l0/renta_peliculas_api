CREATE TABLE peliculas(
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    anio_lanzamiento INT NOT NULL,
    precio_renta DECIMAL(6,2) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE

);

CREATE TABLE clientes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(150) NOT NULL,
    roles JSON NOT NULL DEFAULT ('["user"]')

);

CREATE TABLE stock_peliculas(
    id INT AUTO_INCREMENT PRIMARY KEY,
    pelicula_id INT NOT NULL,
    estado ENUM('disponible', 'rentado', 'perdido') NOT NULL,
    CONSTRAINT fk_stock_pelicula
    FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE rentas(
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    stock_pelicula_id INT NOT NULL,
    fecha_renta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_limite DATETIME NOT NULL,
    fecha_devolucion DATETIME NULL,
    demora DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    estado ENUM('activa', 'devuelta', 'atrasada', 'perdida') NOT NULL DEFAULT 'activa',
    CONSTRAINT fk_renta_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE RESTRICT,
    CONSTRAINT fk_renta_stock
    FOREIGN KEY (stock_pelicula_id) REFERENCES stock_peliculas(id)
    ON DELETE RESTRICT

);

CREATE TABLE pagos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    renta_id INT NOT NULL,
    monto DECIMAL(6,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta') NOT NULL,
    CONSTRAINT fk_pago_renta
    FOREIGN KEY (renta_id) REFERENCES rentas(id)
    ON DELETE CASCADE

);