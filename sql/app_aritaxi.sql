/*
SQLyog - Free MySQL GUI v5.18
Host - 5.0.27-community-nt : Database - aritaxi11
*********************************************************************
Server version : 5.0.27-community-nt
*/

SET NAMES utf8;

SET SQL_MODE='';
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

/*Table structure for table `app_enlaces` */

CREATE TABLE `app_enlaces` (
  `enlaceId` int(11) NOT NULL auto_increment,
  `nombre` varchar(255) default NULL,
  `url` varchar(255) default NULL,
  PRIMARY KEY  (`enlaceId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `app_estadisticas` */

CREATE TABLE `app_estadisticas` (
  `estadisticaId` int(11) NOT NULL auto_increment COMMENT 'Identificador único del registro',
  `ano` int(11) default NULL COMMENT 'Año del registro que se indica',
  `mes` int(11) default NULL COMMENT 'Mes del registro que se indica',
  `licencia` varchar(100) default NULL COMMENT 'Número de la licencia del taxista según alfa',
  `importe` decimal(10,2) default NULL COMMENT 'Acumulado de importe para ese registro en concreto',
  `viajes` int(11) default NULL COMMENT 'Acumulado de viajes para ese registro',
  `importeLiquidable` decimal(10,2) default NULL COMMENT 'Acumulado de importe candidato a liquidar para ese registro en concreto',
  `viajesLiquidable` int(11) default NULL COMMENT 'Acumulado de viajes candidatos a liquidar para ese registro',
  `empresa` varchar(100) default NULL COMMENT 'Código de empresa de la que se han leido las estadísticas puede haber varias para la misma licencia.',
  PRIMARY KEY  (`estadisticaId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='LLeva las estadisticas del número de viajes y acumulado de i';

/*Table structure for table `app_mensajes` */

CREATE TABLE `app_mensajes` (
  `mensajeId` int(11) NOT NULL auto_increment,
  `asunto` varchar(255) default NULL,
  `texto` text,
  `estado` varchar(255) default NULL,
  `fecha` datetime default NULL,
  `pushId` varchar(255) default NULL,
  `necesitaConfirmacion` tinyint(1) default '0',
  `administradorId` int(11) default NULL,
  PRIMARY KEY  (`mensajeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `app_mensajes_usuariospush` */

CREATE TABLE `app_mensajes_usuariospush` (
  `mensajeId` int(11) NOT NULL,
  `usuarioPushId` int(11) NOT NULL,
  `estado` varchar(255) default NULL,
  `fecha` datetime default NULL,
  `confirmado` tinyint(1) default '0',
  PRIMARY KEY  (`mensajeId`,`usuarioPushId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `app_parametros` */

CREATE TABLE `app_parametros` (
  `parametroId` int(11) NOT NULL,
  `tituloPush` varchar(255) default NULL,
  `appId` varchar(255) default NULL,
  `restApi` varchar(255) default NULL,
  `gcm` varchar(255) default NULL,
  `bucket` varchar(255) default NULL,
  `bucket_region` varchar(255) default NULL,
  `bucket_folder` varchar(255) default NULL,
  `identity_pool` varchar(255) default NULL,
  PRIMARY KEY  (`parametroId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `app_recursos` */

CREATE TABLE `app_recursos` (
  `recursoId` int(11) NOT NULL auto_increment,
  `nombre` varchar(255) default NULL,
  `url` varchar(255) default NULL,
  PRIMARY KEY  (`recursoId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

SET SQL_MODE=@OLD_SQL_MODE;