-- aritaxi1.app_enlaces definition

CREATE TABLE `app_enlaces` (
  `enlaceId` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`enlaceId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- aritaxi1.app_estadisticas definition

CREATE TABLE `app_estadisticas` (
  `estadisticaId` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del registro',
  `ano` int(11) DEFAULT NULL COMMENT 'Año del registro que se indica',
  `mes` int(11) DEFAULT NULL COMMENT 'Mes del registro que se indica',
  `licencia` varchar(100) DEFAULT NULL COMMENT 'Número de la licencia del taxista según alfa',
  `importe` decimal(10,2) DEFAULT NULL COMMENT 'Acumulado de importe para ese registro en concreto',
  `viajes` int(11) DEFAULT NULL COMMENT 'Acumulado de viajes para ese registro',
  `importeLiquidable` decimal(10,2) DEFAULT NULL COMMENT 'Acumulado de importe candidato a liquidar para ese registro en concreto',
  `viajesLiquidable` int(11) DEFAULT NULL COMMENT 'Acumulado de viajes candidatos a liquidar para ese registro',
  `empresa` varchar(100) DEFAULT NULL COMMENT 'Código de empresa de la que se han leido las estadísticas puede haber varias para la misma licencia.',
  PRIMARY KEY (`estadisticaId`)
) ENGINE=InnoDB AUTO_INCREMENT=35032410 DEFAULT CHARSET=latin1 COMMENT='LLeva las estadisticas del número de viajes y acumulado de importes por licencia, año y mes';

-- aritaxi1.app_mensajes definition

CREATE TABLE `app_mensajes` (
  `mensajeId` int(11) NOT NULL AUTO_INCREMENT,
  `asunto` varchar(255) DEFAULT NULL,
  `texto` text,
  `estado` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `pushId` varchar(255) DEFAULT NULL,
  `necesitaConfirmacion` tinyint(1) DEFAULT '0',
  `administradorId` int(11) DEFAULT NULL,
  PRIMARY KEY (`mensajeId`)
) ENGINE=InnoDB AUTO_INCREMENT=242 DEFAULT CHARSET=utf8;

-- aritaxi1.app_mensajes_usuariospush definition

CREATE TABLE `app_mensajes_usuariospush` (
  `mensajeId` int(11) NOT NULL,
  `usuarioPushId` int(11) NOT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `confirmado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`mensajeId`,`usuarioPushId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- aritaxi1.app_parametros definition

CREATE TABLE `app_parametros` (
  `parametroId` int(11) NOT NULL,
  `tituloPush` varchar(255) DEFAULT NULL,
  `appId` varchar(255) DEFAULT NULL,
  `restApi` varchar(255) DEFAULT NULL,
  `gcm` varchar(255) DEFAULT NULL,
  `bucket` varchar(255) DEFAULT NULL,
  `bucket_region` varchar(255) DEFAULT NULL,
  `bucket_folder` varchar(255) DEFAULT NULL,
  `identity_pool` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`parametroId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- aritaxi1.app_recursos definition

CREATE TABLE `app_recursos` (
  `recursoId` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`recursoId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

INSERT INTO aritaxi1.app_parametros (parametroId,tituloPush,appId,restApi,gcm,bucket,bucket_region,bucket_folder,identity_pool) VALUES
	 (0,'ARITAXI','8b511c86-a33a-4bd5-a72e-d13bd458fdaa','OTQzM2Y3ZjQtMjY1NC00ZmY3LTllZjktNWIzOGI3ZTM5MTU5','455700045649','tdinf-uploads','eu-west-1','radiosevilla','eu-west-1:c6ce80d5-5707-4631-ae08-eed405f1bf61');



-- Mod sclien
-- login
-- password
-- playerid
-- solomensajes (tinyint)