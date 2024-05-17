docker rm -f aritaxi-push
docker pull ariadnasw/aritaxi-push:latest
docker run -d --name aritaxi-push -p8022:8022 \
-e API_PORT=8022 \
-e EMAIL_HOST=smtp.gmail.com \
-e EMAIL_PORT=465 \
-e EMAIL_SECURE=true  \
-e EMAIL_USER= \
-e EMAIL_DESTINATARIO=vicent@myariadna.com \
-e BASE_MYSQL_SERVER=mysql01.ariadnasw.com \
-e BASE_MYSQL_PORT=3306 \
-e BASE_MYSQL_USER=root \
-e BASE_MYSQL_PASSWORD=aritel \
-e BASE_MYSQL_DATABASE=aritaxi1 \
-e BASE_MYSQL_USUARIOS=usuarios \
-e CUOTAS_TIPO_FACT = FCE,FCN,FRC \
-e VENTA_SOCIO_TIPO_FAC = FAV,FRT] \
-e PUBLICIDAD_TIPO_FACT = FPS \
-e LIQUIDACIONES_TIPO_FACT = FLI,FRL\
-e ARIADNA_S2_URL=http://192.168.1.62:8090 \
-e ESTADISTICAS_LOCAL=Europe/Madrid \
-e ALFA_URL=https://alfa.a-rte.es:9292/ServiceAlfa.svc/rest/ \
-e ALFA_USER=VALARIADNA \
-e ALFA_PASSWORD=2023\
-e ALFA_COMPANYID=43 \
-e ALFA_CONFIGURATIONID=103 \
-e ESTADISTICAS_DELAY=5000 \
-e ALFA_COMPANIES=43,149,197
--restart unless-stopped ariadnasw/aritaxi-push

