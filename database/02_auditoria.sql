CREATE TABLE historial_cambios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tabla_afectada VARCHAR(50) NOT NULL,
  operacion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  usuario_bd VARCHAR(100) NOT NULL,
  fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registro_id INT NOT NULL,
  valores_anteriores JSON NULL,
  valores_nuevos JSON NULL
);

CREATE TABLE log_errores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  procedimiento VARCHAR(100) NOT NULL,
  mensaje_error TEXT NOT NULL,
  usuario_bd VARCHAR(100) NOT NULL,
  fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=Aria;