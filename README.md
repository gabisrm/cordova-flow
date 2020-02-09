# FLUJO
Este documento presenta un flujo de desarrollo para aplicaciones híbridas usando el framework cordova. Principales objetivos:
* Definir una estructura de proyecto que permita una integración con git sencilla, independiente de la plataforma (ios/android/web).
* El código fuente no debe de modificarse a la hora de compilar para ios/android o para un entorno específico (dev, pre, producción). Tampoco debería de modificarse si se compila como debug o release.
* No deben existir ramas distintas en función de la plataforma, ni del entorno al que apunta.
* Se debe poder obtener el código del proyecto de git y generar la aplicación sin necesidad de archivos adicionales.
* En git debe estar identificado con tags toda versión subida a producción en las distintas plataformas, además de identificar fácilmente el código de la versión actualmente en producción para cada plataforma.


## Estructura de Proyecto
Un proyecto de cordova constará de la siguiente estructura de archivos:

```bash
- config.xml
- package.json
- package-lock.json
- config/
  - build.js
  - dev.js
  - pre.js
  - production.js
- www/
  - config/
    - config.js
  - css/
  - img/
  - js/
  - index.html
```

### La carpeta **/config**
Carpeta donde se almacenan los archivos de configuración de cada entorno, además del archivo **build.js**. Dicho archivo ejecuta un script en tiempo de compilación para importar las configuraciones al proyecto en función del entorno, definido por la variable de entorno `NODE_ENV`. El script obtiene el valor del entorno definido en NODE_ENV, y copia el contenido del archivo correspondiente del entorno en **/www/config/config.js**. Por ejemplo, si ejecutamos:
```bash
$ NODE_ENV=dev cordova build android
```
Se copiará el contenido de *config/dev.js* en *www/config/config.js*

Por defecto, y si no está definida la veriable `NODE_ENV`, se aplica la configuración de producción (es decir, la de **config/production.js**).

El código de aplicación podrá entonces depender en el contenido del archivo **www/config/config.js** para importar parámetros de configuración. Valores típicos a definir en los archivos de configuración son la URL del host, proyecto (DKNNA / DKNEU), claves de push, de google...

### La carpeta **/www**
Aquí se almacena todo el código de la aplicación. Importante la existencia de la carpeta **config/**, para permitir la importación de la configuración.

### El archivo **config.xml**
Este archivo contiene la configuración del proyecto de córdova. Incluye las plataformas definidas, los plugins (y sus configuraciones) y los hooks. **IMPORTANTE**: para permitir la funcionalidad de importación de la configuración en tiempo de compilación, es necesario definir el siguiente **hook**:
```xml
<hook type="before_build" src="config/build.js"></hook>
```
Esta línea indica que se ejecute el script en *config/build.js* **antes** de que se realice el build. De esa manera, se poblará el archivo *www/config/config.js* antes de comenzar la compilación de cordova.

### El archivo **package.json**
Este archivo contiene la declaración de las dependencias del proyecto y sus versiones, tanto de las plataformas como la de los plugins

### El archivo **package-lock.json**
Este archivo contiene la declaración del lockfile de las versiones de las dependencias. Se usa en la instalación para producción, o para restaurar un proyecto desde un checkout. Es muy importante que se mantenga en el código, ya que asegura la instalación de las dependencias con la misma versión en la que originalmente se desarrolló



## Git
Los únicos archivos que necesitan estar versionados son los siguientes (ver [Recomendaciones](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/index.html#version-control)):
* **/www**
* **/config**
* **config.xml**
* **package-lock.json**
* **package.json**

Estos archivos son suficientes para generar el proyecto para cada plataforma.

### Generación del proyecto
1. `npm ci`: Esto instala todas las dependencias en el package-lock.json.
2. `cordova prepare`: Crea las estructuras de */plugins* y *platforms* definidas en el package.json con esas mismas versiones
3. `[NODE_ENV=<ENV>] cordova build [ios | android]`: Hace el build del proyecto para la plataforma especificada y para el entorno definido en NODE_ENV (por defecto producción).
4. RUN RELEASE (específico de la plataforma: TBD)


### Ramas


### Workflow Git

Tras una subida a producción **SIEMPRE** hacer un tag

#### Hotfixes
Para hacer un hotfix de una versión de producción, basta con hacer un checkout del tag que se necesite:

```bash
$ git clone <PROJECT>
$ git checkout tags/<TAG> -b hotfix__<MOTIVO>
```

Luego se aplica el cambio, se genera el proyecto con los pasos de [Generación de Proyecto](###Generación-del-proyecto)

Una vez que se haya validado el código, se mergea en la rama de producción, **y en la de desarrollo**:
```bash
$ git checkout production
$ git merge hotfix__<MOTIVO>
$ git checkout development
$ git merge --no-ff hotfix__<MOTIVO>
$ git branch -D hotfix__<MOTIVO> // eliminamos el branch
```

Es esta versión del production la que se sube al android studio y testflight.

Una vez que calidad le da el visto bueno a la versión de testflight/google play.

Y por último tageamos la nueva versión en production a raiz del merge del hotfix. Se aumenta la versión de PATCH.
```bash
$ git tag -a vX.X.X -m "Hotfix version"
```
