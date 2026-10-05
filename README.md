# TecniTute — Beta 1.1

Juego local de Tute por parejas para un jugador y tres rivales/compañero controlados por el ordenador. Proyecto independiente de TecniMus: conserva sus ilustraciones de palos y figuras y la estética de mesa, con un motor específico de Tute.

## Publicar en GitHub Pages

Sube el contenido de esta carpeta a la raíz de un repositorio nuevo, o a una subcarpeta de tu web. Activa Pages para esa ubicación. No requiere compilación, servidor de aplicación ni claves. Conserva TecniMus en su propio repositorio o subcarpeta si quieres ambos juegos. Para desarrollo local: `python3 -m http.server 8080` y abre `http://localhost:8080`.

El manifiesto permite instalar el acceso directo como TecniTute. El service worker guarda los archivos del juego para jugar sin conexión después de la primera carga. La tipografía de Google es opcional: sin red se usa la fuente del dispositivo. Sonido sintetizado sin descargar archivos de audio; el navegador lo habilita tras tocar la pantalla o pulsar una tecla.

## Cómo jugar

- Cuatro jugadores, parejas enfrentadas, diez cartas por jugador. Se juega hacia la derecha: tú, rival de la derecha, compañero, rival de la izquierda.
- Repartidor inicial aleatorio; la última carta del repartidor pinta el triunfo. La mano abre la primera baza, después abre quien ganó la anterior. El reparto y la mano rotan en cada nueva mano.
- Selecciona una carta iluminada y pulsa **Jugar**. La selección exige confirmación para evitar errores al tocar las cartas pequeñas.
- Orden de fuerza: as, tres, rey, caballo, sota, siete, seis, cinco, cuatro, dos. Valores: 11, 10, 4, 3, 2 y cero para las restantes.
- Se debe asistir al palo de salida y montar cuando se pueda. Sin ese palo, hay que fallar y pisar si se puede. Cuando no se puede pisar un triunfo, se permite cualquier carta. También se aplican las obligaciones si está ganando el compañero.
- Tras ganar una baza, cada jugador de la pareja ganadora tiene su propia oportunidad de cantar una vez. Rey y caballo del mismo palo todavía en la mano: 40 si es triunfo; 20 en los demás. Un jugador con las 40 disponibles debe cantarlas antes de sus veinte. Un mismo palo no se canta dos veces por jugador.
- En esa ventana, cuatro reyes o cuatro caballos en una misma mano permiten declarar tute y ganar esa mano inmediatamente. No se suman cartas entre compañeros.
- La última baza vale **10 puntos adicionales**. Se interpretó «las 10 del monte» como estas diez de últimas; esta modalidad no tiene monte de robo.
- Gana la mano la pareja con más puntos. En empate gana la pareja que tomó la última baza. Se juega una partida a **tres manos ganadas** (duración elegida para esta versión).

Referencia de la modalidad: https://www.nhfournier.es/como-jugar/tute/ . Existen variantes de mesa; las reglas usadas aquí están expresadas arriba para evitar ambigüedades.

## Incluido

Cartas animadas desde cada jugador al centro; recogida de baza hacia el ganador; turnos individuales destacados; mano y triunfo permanentes; bocadillos; cantes del compañero visibles; sonidos diferenciados de carta, baza, canto y victoria/derrota; volumen y sonido persistentes; consejos opcionales inicialmente apagados; recuento de cartas/cantes/últimas y libreta de bazas; interfaz móvil con acciones inferiores; preferencia de movimiento reducido; emblema TecniTute personalizado en cabecera, tapete e iconos.

Las cartas numéricas muestran tantas imágenes del palo como indica su valor, con espadas pequeñas y contenidas. Se conservan sota, caballo y rey personalizados. Los contrincantes mantienen sus cartas ocultas hasta terminar la mano. La IA decide con su propia mano y las cartas de la baza, sin leer manos ajenas.

## Estructura y pruebas

`rules.js`: reglas y estados puros, validación de jugadas y recuento. `tute.js`: interfaz, temporización, sonidos y animaciones. `style.css`: presentación. `tests/`: pruebas ejecutables sin dependencias con Node.js.

```sh
node tests/rules.cjs
node tests/interface.cjs
```

Verificado automáticamente: 100 partidas deterministas (397 manos completas, 309 cantes), conservación de las 40 cartas, total de 120 puntos de cartas + 10 de últimas + cantes, obligaciones de palo/triunfo, prioridad de cuarenta, participación de ambos compañeros, tute, desempate, rotación, rechazo de acciones inválidas, cinco manos desde una simulación DOM, preferencias y reinicio mientras una jugada está pendiente.

Limitación de esta entrega: las pruebas DOM no son un navegador. Queda pendiente probar visualmente en dispositivos reales el móvil estrecho/estándar/escritorio, la fluidez de las animaciones, el audio y la instalación. No se dispone de un navegador ejecutable en el entorno de creación. Primera versión jugable, no validación definitiva de todas las variantes locales del Tute.

## Beta 1.1 — Logo personalizado

Integra el emblema aportado por el usuario, conservando su dibujo completo. Iconos de 192/512 px, icono adaptable, Apple Touch de 180 px y favicon de 48 px. Caché versionada para actualizar los recursos. Si un acceso directo existente conserva el icono antiguo tras recargar la web, elimínalo y vuelve a añadirlo. Motor y reglas sin cambios.
