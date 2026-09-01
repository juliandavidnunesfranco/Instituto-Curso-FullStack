# Primeros Pasos

#### Preparando tu compu

<div class="iframeContainer">
  <iframe src="https://player.vimeo.com/video/638636752" title="Instructivo de Primeros Pasos" allow="autoplay; fullscreen"></iframe>
</div>

## Homeworks

Cada unidad tiene su carpeta `homework` con los ejercicios correspondientes.

**IMPORTANTE:** Para ejecutar los tests de cada homework tenes que pararte en la carpeta donde clonaste tu repo (es decir la carpeta donde está este `README.md`) y ejecutar el siguiente comando:

```bash
npm install
```

Esto instalará todas las dependencias necesarias (lo tenés que hacer una sóla vez), una vez terminado y cada vez que quieras ver cuantos tests pasaste ejecutá:

```bash
npm test {nombre del homework}.test.js
```

Por ejemplo, para ejecutar los tests del homework 02, ejecutar: `npm test JSII.test.js`, el del homework 01: `npm test JSI.test.js`
y así.

> No todos los homeworks tienen tests, está detallado en la descripción de cada uno.

> **Importante**: Github cambió el método de autenticación, ahora es por PAT (Personal Access Token), para crearlo pueden seguir este [link](https://docs.github.com/es/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). Pueden elegir expiration infinita para hacerlo una sóla vez.

## Cómo usar SLACK

<div class="iframeContainer">
  <iframe src="https://player.vimeo.com/video/548902078?h=e82a766bab&amp;title=0&amp;byline=0&amp;portrait=0&amp;speed=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="1264" height="720" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Prep Course - Intro a Slack"></iframe>
</div>

> Gracias [Nico Constantin (FT#12)](https://github.com/NicoConstantin) por el video y la explicación!

## Editores de Texto

Para poder escribir código que pueda ser interpretado por un lenguaje de programación, necesitamos utilizar un editor de texto.

Hay varios, puedes probarlos y optar por el que te sientas más a gusto.

A continuación veremos una lista de los más populares:

### Sublime Text

![Sublime Text](/_src/assets/00-PrimerosPasos/sublimeText_screen.png)

Es un editor de texto liviano, que cuenta con una serie de plugins para adaptarlo a las necesidades de cada desarrollador.

Es multiplataforma, por lo que se puede instalar tanto en Windows, como Linux y OS X.

Para instalarlo, realizaremos los siguientes pasos:

#### En Windows o en OS X

1. Nos dirigimos a la página oficial de [Sublime Text](https://www.sublimetext.com).

2. Al ingresar, detectará automáticamente el sistema operativo que tenemos, y nos sugerirá descargar el instalador apropiado.

3. Presionamos el botón **_Download_**.

4. Elegimos la opción adecuada según nuestro sistema operativo e iniciamos la descarga.

![Sublime Text Download](/_src/assets/00-PrimerosPasos/sublimeText_download.png)

5. Finalizada la descarga, ejecutamos el instalador, seleccionamos las opciones **_siguiente, siguiente, etc_**, hasta completar el proceso.

#### En Linux, en la distribución Ubuntu y derivados

1. Nos dirigimos al sitio oficial de Sublime Text. Aquí encontrarás las instrucciones para instalarlo:

[Descargar Sublime Text para Linux](https://www.sublimetext.com/docs/3/linux_repositories.html)

2. En la terminal, ejecutamos el siguiente comando, para instalar la clave GPG:

```shell
wget -q0 - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
```

3. Para asegurarnos de que `apt` esté configurado para trabajar con orígenes https, ejecutamos:

```shell
sudo apt-get install apt-transport-https
```

4. Luego para agregar el repositorio estable, ejecutamos:

```shell
echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list
```

5. Finalmente, procedemos a instalar el programa:

```shell
sudo apt-get install sublime-text
```

Ahora, si en el **Menú de inicio** buscamos **Sublime text**, veremos la siguiente imagen:

![Sublime Text Linux](/_src/assets/00-PrimerosPasos/sublimeText_linux.png)

### Atom

![Atom Site](/_src/assets/00-PrimerosPasos/atom_site.png)

Es un editor de código abierto, disponible tanto para Windows, como Linux y para OS X.

Tiene integrada una consola de Git y Github, para llevar un control de versiones de tus proyectos.
Para comenzar el proceso de instalación, realizamos los siguientes pasos:

En Windows, Linux o en OS X, nos dirigimos al sitio oficial, mediante el siguiente enlace:

<https://atom.io/>

Al ingresar, el navegador detecta automáticamente el instalador que necesitamos bajar, según nuestro sistema operativo.

Allí, presionamos el botón Download para almacenarlo en nuestra computadora.

#### En Windows

Una vez finalizada la descarga, hacemos doble click en el instalador y esperamos a que finalice el proceso de instalación.

#### En Ubuntu y derivados

Descomprimimos el instalador, hacemos doble click, y nos dirigimos a: `/usr/bin/atom`

Al hacer doble click, se abrirá el editor.

### Visual Studio Code

![VSC Console](/_src/assets/00-PrimerosPasos/vsc_console.png)

Es un editor desarrollado por Microsoft.

Tiene integrado el control de versiones mediante Git y Github para tener un seguimiento de tus proyectos. Brinda una cantidad de extensiones que facilitan el trabajo de un desarrollador.

Para descargarlo, nos dirigimos al sitio oficial, en la sección Dowload y descargamos el instalador según nuestro Sistema Operativo:

<https://code.visualstudio.com/download>

![VSC Download](/_src/assets/00-PrimerosPasos/vsc_download.png)

Una vez finalizada la descarga, procedemos a ejecutar el instalador.

## Instalando Node.JS

Para instalar Node js en nuestra computadora, nos dirigimos al sitio oficial:

<https://nodejs.org/es/>

Al ingresar, el sitio detectará nuestro Sistema Operativo y nos sugerirá que descarguemos el instalador adecuado.

![Node.JS Screen](/_src/assets/00-PrimerosPasos/nodejs_screen.png)

Para proceder a la descarga, seleccionamos la versión LTS, que es la versión estable.
Una vez finalizada la descarga, procedemos a ejecutar el instalador.

Para corroborar que Node js se instaló correctamente, procedemos a ejecutar el siguiente comando por la consola o terminal de nuestro sistema operativo:

```shell
node -v
```

Y si seguimos los pasos anteriores, la consola o terminal, nos devolverá la versión de Node js que tenemos instalada:

```shell
v12.18.3
```

## Git

### ¿Qué es Git?

Git es un sistema de control de versiones, distribuido y open source. Un control de versiones es un sistema que registra los cambios realizados en un archivo o conjunto de archivos a lo largo del tiempo, de modo que puedas recuperar versiones específicas más adelante.

### Instalación

#### Para Mac y Linux

Ver estos enlaces:

<https://git-scm.com/book/es/v2/Inicio---Sobre-el-Control-de-Versiones-Instalaci%C3%B3n-de-Git>

<https://www.youtube.com/watch?v=PSULlxUk744>

<https://www.youtube.com/watch?v=oV0spTF71AI>

#### Para Windows

Ingreso a <https://git-scm.com> y descargo la útlima versión.

![installGit](/_src/assets/00-PrimerosPasos/instalar_window.png)

Una vez descargado, se abre el archivo .exe y van a visualizar la siguiente ventana

![installGit](/_src/assets/00-PrimerosPasos/1.png)

Clickeamos “Next” hasta que llegamos a esta parte:

![installGit](/_src/assets/00-PrimerosPasos/2.png)

En este momento de la instalación si quieres puedes elegir el editor de texto que van a usar. (Importante, ténganlo instalado antes de instalar Git)

Seguimos clickeando “Next” y luego “Install”

![installGit](/_src/assets/00-PrimerosPasos/3.png)

Por último, finalizar! Si seleccionan la opción "Launch Git Bash", una vez que finalizan la instalación se va a abrir la consola

![installGit](/_src/assets/00-PrimerosPasos/4.png)

Otra forma de abrir la consola es haciendo click derecho sobre el escritorio y elegir la opción "Git Bash Here"

![installGit](/_src/assets/00-PrimerosPasos/consola.png)

Una vez instalado Git van a poder visualizar la consola: ingresamos el comando `git --version` para chequear que está instalado. Si ven la consola así, ya están listos para comenzar a trabajar!

![installGit](/_src/assets/00-PrimerosPasos/5.png)

## GitHub

### ¿Qué es GitHub?

Es una red para almacenar tus repositorios, sería un repositorio de repositorios. Es uno de los tantos disponibles en internet, y el más popular. GitHub **NO** es lo mismo que Git, aunque funcionen muy bien juntos. Github es un lugar donde podés compartir tu código o encontrar otros proyectos. También actúa como portfolio para cualquier código en el que hayas trabajado.

### Comenzando

1. Para comenzar nos creamos una cuenta --- > <https://github.com> 🚀

![GitHub-Register](/_src/assets/00-PrimerosPasos/github_register.png)

2. Una vez registrados, ingresamos con usuario y contraseña:

![GitHub-Login](/_src/assets/00-PrimerosPasos/github_login.png)

3. Listo! Ahora vemos una página de inicio como la siguiente:

![GitHub-Home](/_src/assets/00-PrimerosPasos/github_home.png)

A la izquierda tenemos un acceso rápido a **mis repositorios**.

En el centro vemos la actividad de los usuarios a quienes seguimos.

En la parte superior derecha, vemos nuestra imagen de perfil. Desde ahí podemos desplegar opciones para gestionar nuestro perfil, repositorios y configuración. Si accedemos a nuestro perfil encontramos algo parecido a esto:

![GitHub-profile](/_src/assets/00-PrimerosPasos/github_profile.png)

Podemos poner una foto de perfil, editar el nombre, agregar la ubicación, link y organizaciones a las que pertenecemos. En el centro podemos fijar los repositorios que queremos mostrar para que estén visibles en nuestro perfil.

Más abajo se muestra un diagrama de todas las contribuciones que vamos haciendo a los repositorios.

Si accedemos a la pestaña de arriba que dice `repositorios` veremos una lista de todos ellos. Cuando elegimos un repositorio para ver, nos lleva a una página como esta:

![GitHub-repo](/_src/assets/00-PrimerosPasos/github_repo.png)

Así se ve un repositorio. Arriba a la izquierda tenemos el `nombre de usuario/nombre del repo`.

En el centro podemos ver todos los archivos que tiene dentro el repo. El botón verde que dice `Code` es importante, si clickeamos ahí vamos a poder obtener la url del repo, para así poder **_clonarlo_** (esto lo veremos más adelante).

Arriba a la derecha encontramos tres botones. `Watch` nos permite seguir un repositorio, mientras que con `Star` podemos marcar como favorito un repo que nos guste. Por último tenemos `Fork`, este es **muy** importante, lo vamos a necesitar cuando hagamos el **_Challenge!_**

Ya tenemos todo para empezar... Éxitos!!! 🍀

---

#### Si tienes dudas sobre este tema, puedes consultarlas en el canal ***01a-primeros-pasos*** de Slack