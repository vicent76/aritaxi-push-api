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
  PRIMARY KEY (`estadisticaId`)
) ENGINE=InnoDB AUTO_INCREMENT=5955 DEFAULT CHARSET=latin1 COMMENT='LLeva las estadisticas del número de viajes y acumulado de importes por licencia, año y mes';