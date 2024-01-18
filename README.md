# AriTaxiApi


## Parámetros del fichero de configuración
Se utiliza un fichero de configuración tipo .env con el siguiente significado para cada parámetro.
### Configuracion general  
**API_PORT**= Indica el puerto en el que escuchará la api  
**API_HOST**= Servidor en el que arranca la api  



### Configuracion correo  
**EMAIL_HOST**= Servidor smtp del correo electrónico  
**EMAIL_PORT**= Puerto smtp del servidor  
**EMAIL_SECURE**= Utilza comunicaciones encriptadas (true/false)  
**EMAIL_USER**= Usuario del correo  
**EMAIL_PASS**= Contraseña del correo  
**EMAIL_DESTINATARIO**= Dirección de correo a la que se le enviarán las notificaciones  

### Configuracion mysql para recuperar la empresa
**BASE_MYSQL_SERVER**= Dirección del servidor MYSQL por defecto  
**BASE_MYSQL_PORT**= Puerto de MYSQL  
**BASE_MYSQL_USER**= Usuario de MYSQL  
**BASE_MYSQL_PASSWORD**= Contraseña del usuario MYSQL   
**BASE_MYSQL_DATABASE**= base de datos de destino de las consultas

### tipos de facturas que se recuperan según su tipo, se expresan como un array de objetos con valores de tipo string con los tipos deseados
**CUOTAS_TIPO_FACT**=[]
**VENTA_SOCIO_TIPO_FAC**=[]
**PUBLICIDAD_TIPO_FACT**=[]
**LIQUIDACIONES_TIPO_FACT**=[]



  
**ARIADNA_S2_URL**=Dirección en la que está escuchando el servicio S2 que se encarga de la generación de las facturas en PDF y su envío por correo  


