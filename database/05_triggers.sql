DELIMITER $$

CREATE TRIGGER trg_before_insert_renta
BEFORE INSERT ON rentas
FOR EACH ROW
BEGIN
  DECLARE v_estado_stock VARCHAR(20);


  IF NEW.fecha_limite <= NEW.fecha_renta THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La fecha límite debe ser posterior a la fecha de renta';
  END IF;


  SELECT estado INTO v_estado_stock
  FROM stock_peliculas
  WHERE id = NEW.stock_pelicula_id;

  IF v_estado_stock IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El ejemplar especificado no existe';
  ELSEIF v_estado_stock <> 'disponible' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No se puede rentar un ejemplar que no está disponible';
  END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_after_insert_renta
AFTER INSERT ON rentas
FOR EACH ROW
BEGIN
  INSERT INTO historial_cambios (
    tabla_afectada, operacion, usuario_bd, registro_id,
    valores_anteriores, valores_nuevos
  )
  VALUES (
    'rentas', 'INSERT', USER(), NEW.id,
    NULL,
    JSON_OBJECT(
      'cliente_id', NEW.cliente_id,
      'stock_pelicula_id', NEW.stock_pelicula_id,
      'fecha_renta', NEW.fecha_renta,
      'fecha_limite', NEW.fecha_limite,
      'estado', NEW.estado
    )
  );
END$$

CREATE TRIGGER trg_after_update_renta
AFTER UPDATE ON rentas
FOR EACH ROW
BEGIN
  INSERT INTO historial_cambios (
    tabla_afectada, operacion, usuario_bd, registro_id,
    valores_anteriores, valores_nuevos
  )
  VALUES (
    'rentas', 'UPDATE', USER(), NEW.id,
    JSON_OBJECT(
      'estado', OLD.estado,
      'fecha_devolucion', OLD.fecha_devolucion,
      'demora', OLD.demora
    ),
    JSON_OBJECT(
      'estado', NEW.estado,
      'fecha_devolucion', NEW.fecha_devolucion,
      'demora', NEW.demora
    )
  );
END$$

CREATE TRIGGER trg_after_delete_renta
AFTER DELETE ON rentas
FOR EACH ROW
BEGIN
  INSERT INTO historial_cambios (
    tabla_afectada, operacion, usuario_bd, registro_id,
    valores_anteriores, valores_nuevos
  )
  VALUES (
    'rentas', 'DELETE', USER(), OLD.id,
    JSON_OBJECT(
      'cliente_id', OLD.cliente_id,
      'stock_pelicula_id', OLD.stock_pelicula_id,
      'estado', OLD.estado
    ),
    NULL
  );
END$$

DELIMITER ;