CREATE TABLE aritaxi1.app_estadisticas (
	estadisticaId INT auto_increment NOT NULL COMMENT 'Identificador único del registro',
	ano INT NULL COMMENT 'Año del registro que se indica',
	mes INT NULL COMMENT 'Mes del registro que se indica',
	licencia varchar(100) NULL COMMENT 'Número de la licencia del taxista según alfa',
	importe DECIMAL(10,2) NULL COMMENT 'Acumulado de importe para ese registro en concreto',
	viajes INT NULL COMMENT 'Acumulado de viajes para ese registro',
	CONSTRAINT app_estadisticas_pk PRIMARY KEY (estadisticaId)
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci
COMMENT='LLeva las estadisticas del número de viajes y acumulado de importes por licencia, año y mes';
