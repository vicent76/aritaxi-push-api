ALTER TABLE `app_mensajes_usuariospush`   
	ADD COLUMN `respuesta` TINYINT(1) DEFAULT 0 NULL AFTER `confirmado`,
	ADD COLUMN `textoRespuesta` TEXT NULL AFTER `respuesta`,
	ADD COLUMN `leidaRespuesta` TINYINT(1) DEFAULT 0 NULL AFTER `textoRespuesta`;
