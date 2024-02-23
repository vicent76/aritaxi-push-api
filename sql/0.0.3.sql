ALTER TABLE `aritaxi1`.`app_mensajes`   
  ADD COLUMN `necesitaConfirmacion` TINYINT(1) DEFAULT 0 NULL AFTER `pushId`;

  ALTER TABLE `aritaxi1`.`app_mensajes_usuariospush`   
  ADD COLUMN `confirmado` TINYINT(1) DEFAULT 0 NULL AFTER `fecha`;

