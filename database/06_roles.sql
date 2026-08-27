CREATE ROLE rol_operador;
CREATE ROLE rol_auditor;

GRANT EXECUTE ON PROCEDURE renta_peliculas.sp_rentar_pelicula TO rol_operador;
GRANT EXECUTE ON PROCEDURE renta_peliculas.sp_devolver_pelicula TO rol_operador;
GRANT EXECUTE ON PROCEDURE renta_peliculas.sp_procesar_rentas_vencidas TO rol_operador;
GRANT SELECT (id, titulo, precio_renta) ON renta_peliculas.peliculas TO rol_operador;
GRANT SELECT (id, pelicula_id, estado) ON renta_peliculas.stock_peliculas TO rol_operador;


GRANT SELECT ON renta_peliculas.historial_cambios TO rol_auditor;
GRANT SELECT ON renta_peliculas.log_errores TO rol_auditor;

CREATE USER 'operador_renta'@'%' IDENTIFIED BY 'Operador2026!';
CREATE USER 'auditor_renta'@'%' IDENTIFIED BY 'Auditor2026!';
GRANT rol_operador TO 'operador_renta'@'%';
GRANT rol_auditor TO 'auditor_renta'@'%';
SET DEFAULT ROLE rol_operador FOR 'operador_renta'@'%';
SET DEFAULT ROLE rol_auditor FOR 'auditor_renta'@'%';
FLUSH PRIVILEGES;