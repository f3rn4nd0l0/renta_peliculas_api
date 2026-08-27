DELIMITER $$

CREATE FUNCTION fn_calcular_mora(
  p_fecha_limite DATETIME,
  p_fecha_devolucion DATETIME
)
RETURNS DECIMAL(6,2)
DETERMINISTIC
NO SQL
BEGIN
  DECLARE v_dias_atraso INT DEFAULT 0;
  DECLARE v_mora DECIMAL(6,2) DEFAULT 0.00;

  IF p_fecha_devolucion IS NOT NULL AND p_fecha_devolucion > p_fecha_limite THEN
    SET v_dias_atraso = DATEDIFF(p_fecha_devolucion, p_fecha_limite);
    SET v_mora = v_dias_atraso * 10.00;
  END IF;

  RETURN v_mora;
END$$

CREATE FUNCTION fn_categoria_cliente(
  p_total_gastado DECIMAL(10,2)
)
RETURNS VARCHAR(20)
DETERMINISTIC
NO SQL
BEGIN
  DECLARE v_categoria VARCHAR(20);

  IF p_total_gastado >= 500.00 THEN
    SET v_categoria = 'Oro';
  ELSEIF p_total_gastado >= 200.00 THEN
    SET v_categoria = 'Plata';
  ELSE
    SET v_categoria = 'Bronce';
  END IF;

  RETURN v_categoria;
END$$

DELIMITER ;