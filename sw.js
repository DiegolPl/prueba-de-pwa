;
//Asignar un nombre y version al cache
const CACHE_NAME = 'v1_cache_programador_fitness',
    urlsToCache = [
        './',
        'https://fonts.googleapis.com/css?family=Raleway:400,700',
        'https://fonts.gstatic.com/s/raleway/v12/1Ptrg8zYS_SKggPNwJYtWqZPAA.woff2',
        'https://use.fontawesome.com/releases/v5.0.7/css/all.css',
        'https://use.fontawesome.com/releases/v5.0.6/webfonts/fa-brands-400.woff2',
        './style.css',
        './script.js',
        './img/ProgramadorFitness.png',
        './img/favicon.png'
    ]

//Durante la fase de instalacion, generalmente se almacena en cache los activos estaticos
self.addEventListener('install', e => {
    // El evento e va a ejecutar un metodo "espera hasta que ..." 
    e.waitUntil(
        //...hasta que el objeto cache del Service Worker pueda abrir el cache que le indicamos en CACHE_NAME.
        caches.open(CACHE_NAME)
        //El metodo .open() devuelve una promesa donde vamos a manipular la entrada de todas las url que voy a registrar x medio del parametro 'cache' que son las que quiero que se guarden en el cache del dispositivo (las que estan en el array urlsToCache)
            .then(cache => {
                //Me retorne todo el cache y le agregue al cache del dispositivo todas las que tengo en 'urlsToCache'
                return cache.addAll(urlsToCache)
                    //El siguiente metodo q mandamos es para que se mantenga esperando en lo que termina toda la lista
                    .then(()=>self.skipWaiting())
            })
            //Si hay algun error, lo capturamos en el catch
            .catch(err => console.log('Fallo registro de cache',err))
    )
})

//Una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexion
//El evento 'activate' se activa cuando el SW empieza a buscar los recursos y cuando perdemos la conexion a internet
self.addEventListener('activate', e => {
    //Creamos una constante para la 'lista blanca' de cache la cual va a servir como copia para comparar si la info q teniamos en el cache original a cambiado (por desconexion o actualizacion de archivo) 

    //Descomposicion
    const cacheWhitelist = [CACHE_NAME]

    //Comparamos para detectar cuales archivos sufrieron cambios.
    e.waitUntil(
        //Llamamos al metodo .keys() que me va a permitir ver las llaves y cuales de ellas sufrieron cambios. 
        caches.keys()
        //Este metodo devuelve una promesa con el nombre de los archivos que estan en el cache (cacheNames). Con ello ejecutamos un metodo funcional de los arreglos en JS llamado .map() que me permite transformar un array.
        .then(cacheNames => {
            return Promise.all(
            cacheNames.map(cacheName => {
                //Le decimos que el 'cacheName' que le pasamos lo evalue. Si fue cambiado o caduco lo eliminara.

                //Eliminamos lo que ya no se necesita en cache
                if (cacheWhitelist.indexOf(cacheName) === -1) {
                return caches.delete(cacheName)
                }
            })
            )
        })
        // Le indica al SW activar el cache actual - que ya termino de actualizar la cache x lo que debe activar la actual.
        .then(() => self.clients.claim())
    )
})

//Cuando el navegador recupera una url - Actualiza el archivo al mas actual
//El metodo fetch es el que ira a consultar y responder con los objetos de la cache y va a verificar si efectivamente existe una url real. 
self.addEventListener('fetch', e => {
    //Responder ya sea con el objeto en caché o continuar y buscar la url real
    e.respondWith(
        //Vamos a buscar una coincidencia con .match() a cada una de las peticiones que haga dicho metodo fetch. Dicho metodo .request es una promesa que devuelve una respuesta.
        caches.match(e.request)
        .then(res => {
            //Si la respuesta se recupera significa que la url es real y entonces la retorna.
            if (res) {
            //recuperar del cache
            return res
            }
            //Si detecta que no detecto el recurso de cache y tuvo que consultar una url real entonces devuelve la solicitud de ese archivo con la nueva api de js llamada fetch.
            //recuperar de la petición a la url
            return fetch(e.request)
        })
    )
})
