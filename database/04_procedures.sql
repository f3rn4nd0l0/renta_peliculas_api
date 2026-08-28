DELIMITER $$

CREATE PROCEDURE sp_rentar_pelicula(
  IN p_cliente_id INT,
  IN p_pelicula_id INT,
  IN p_dias_renta INT,
  OUT p_renta_id INT,
  OUT p_mensaje VARCHAR(200)
)
proc_body: BEGIN
  DECLARE v_stock_id INT DEFAULT NULL;
  DECLARE v_error_msg TEXT DEFAULT '';

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
    ROLLBACK;
    INSERT INTO log_errores (procedimiento, mensaje_error, usuario_bd)
    VALUES ('sp_rentar_pelicula', v_error_msg, USER());
    SET p_renta_id = NULL;
    SET p_mensaje = CONCAT('Error al rentar: ', v_error_msg);
  END;

  START TRANSACTION;

  SELECT id INTO v_stock_id
  FROM stock_peliculas
  WHERE pelicula_id = p_pelicula_id AND estado = 'disponible'
  LIMIT 1
  FOR UPDATE;

  IF v_stock_id IS NULL THEN
    SET p_mensaje = 'No hay ejemplares disponibles para esta película';
    SET p_renta_id = NULL;
    ROLLBACK;
    LEAVE proc_body;
  END IF;


  INSERT INTO rentas (cliente_id, stock_pelicula_id, fecha_limite)
  VALUES (p_cliente_id, v_stock_id, DATE_ADD(NOW(), INTERVAL p_dias_renta DAY));

  UPDATE stock_peliculas SET estado = 'rentado' WHERE id = v_stock_id;

  SET p_renta_id = LAST_INSERT_ID();
  SET p_mensaje = 'Renta registrada correctamente';

  COMMIT;
END$$

DELIMITER $$


CREATE PROCEDURE sp_devolver_pelicula(
  IN p_renta_id INT,
  OUT p_mora_calculada DECIMAL(6,2),
  OUT p_mensaje VARCHAR(200)
)
proc_body: BEGIN
  DECLARE v_stock_id INT;
  DECLARE v_fecha_limite DATETIME;
  DECLARE v_estado_actual VARCHAR(20);
  DECLARE v_error_msg TEXT DEFAULT '';

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
    ROLLBACK;
    INSERT INTO log_errores (procedimiento, mensaje_error, usuario_bd)
    VALUES ('sp_devolver_pelicula', v_error_msg, USER());
    SET p_mora_calculada = NULL;
    SET p_mensaje = CONCAT('Error al devolver: ', v_error_msg);
  END;

  START TRANSACTION;

  SELECT stock_pelicula_id, fecha_limite, estado
  INTO v_stock_id, v_fecha_limite, v_estado_actual
  FROM rentas
  WHERE id = p_renta_id
  FOR UPDATE;

  IF v_stock_id IS NULL THEN
    SET p_mensaje = 'Renta no encontrada';
    SET p_mora_calculada = NULL;
    ROLLBACK;
    LEAVE proc_body;
  END IF;

  IF v_estado_actual = 'devuelta' THEN
    SET p_mensaje = 'Esta renta ya fue devuelta anteriormente';
    SET p_mora_calculada = NULL;
    ROLLBACK;
    LEAVE proc_body;
  END IF;

  SET p_mora_calculada = fn_calcular_mora(v_fecha_limite, NOW());

  UPDATE rentas
  SET fecha_devolucion = NOW(),
      estado = 'devuelta',
      demora = p_mora_calculada
  WHERE id = p_renta_id;

  UPDATE stock_peliculas
  SET estado = 'disponible'
  WHERE id = v_stock_id;

  SET p_mensaje = 'Devolución registrada correctamente';

  COMMIT;
END$$

DELIMITER $$

CREATE PROCEDURE sp_procesar_rentas_vencidas(
  IN p_dias_umbral INT,
  OUT p_procesadas INT,
  OUT p_omitidas INT
)
proc_body: BEGIN
  DECLARE v_renta_id INT;
  DECLARE v_fin_cursor INT DEFAULT FALSE;
  DECLARE v_error_msg TEXT DEFAULT '';

  DECLARE cur_rentas_vencidas CURSOR FOR
    SELECT id FROM rentas
    WHERE estado = 'activa'
      AND fecha_limite < DATE_SUB(NOW(), INTERVAL p_dias_umbral DAY);

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin_cursor = TRUE;

  SET p_procesadas = 0;
  SET p_omitidas = 0;

  OPEN cur_rentas_vencidas;

  ciclo_rentas: LOOP
    FETCH cur_rentas_vencidas INTO v_renta_id;

    IF v_fin_cursor THEN
      LEAVE ciclo_rentas;
    END IF;

    SAVEPOINT sp_antes_de_fila;

    BEGIN
      DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
      BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
        ROLLBACK TO SAVEPOINT sp_antes_de_fila;
        INSERT INTO log_errores (procedimiento, mensaje_error, usuario_bd)
        VALUES ('sp_procesar_rentas_vencidas', v_error_msg, USER());
        SET p_omitidas = p_omitidas + 1;
      END;

      UPDATE rentas SET estado = 'atrasada' WHERE id = v_renta_id;
      SET p_procesadas = p_procesadas + 1;
    END;

  END LOOP ciclo_rentas;

  CLOSE cur_rentas_vencidas;
END$$

DELIMITER ;