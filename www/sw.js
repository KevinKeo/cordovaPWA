const FILES_TO_CACHE = [
'index.html',
'conference.html',
'conferences.html',
'nav.html',
'notes.html',
'presentateur.html',
'presentateurs.html',
'js/jquery-3.2.1.min.js',
'js/localforage.js',
'js/notes.js',
'js/popper.min.js',
'js/sessions.js',
'js/speakers.js',
'css/bootstrap.min.css',
'js/bootstrap.min.js',
'app.js'
];

const STATIC_CACHE_NAME = 'pages-cache-v3.0.0';

self.skipWaiting();

self.addEventListener('activate', event => {
    console.log('Activating new service worker...');
    const cacheWhitelist = [STATIC_CACHE_NAME];
    // suppression des caches excepté le cache courant (STATIC_CACHE_NAME)
    event.waitUntil(
    caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cacheName => {
                if (cacheWhitelist.indexOf(cacheName) < 0) {
                    return caches.delete(cacheName);
                }
            })
        );
    }));
});

/*
 if(event.request.url == "https://raw.githubusercontent.com/DevInstitut/conference-data/master/sessions.json"){
            localforage.config({storeName: dbsessions});
            var sessions = [];
            return localforage.iterate(function(value, key, iterationNumber) {
                sessions.push(value);
            }).then(function() { 
                var myJsonString = JSON.stringify(sessions);
                console.log(response);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(myJsonString);
                return response;
            }).catch(function(err) {
                // This code runs if there were any errors
                console.log(err);
            });
        }

          localforage.config({storeName: dbsessions});
                    var sessions = [];
                    return localforage.iterate(function(value, key, iterationNumber) {
                        sessions.push(value);
                    }).then(function() {
                        return sessions;
                    }).catch(function(err) {

                        console.log("ERRORERRORERRORERRORERRORERRORERRORERRORERRORERRORERROR");
                        // This code runs if there were any errors
                        console.log(err);
                    })
*/
self.addEventListener('fetch', event => {
    console.log('Fetching:', event.request.url);
    /*
    if(event.request.url == "https://raw.githubusercontent.com/DevInstitut/conference-data/master/sessions.json"){
        event.respondWith(
            fetch("https://raw.githubusercontent.com/DevInstitut/conference-data/master/sessions.json").then(function(response){
                if(response.status != 200) {
                  
                } else {
                    console.log("SESSION JSON FROM NETWORK FETCH");
                }
            })
        )
    } else if(event.request.url == "https://raw.githubusercontent.com/DevInstitut/conference-data/master/speakers.json"){
        event.respondWith(
            fetch(event.request).then(function(response){
                if(response.status != 200) {
                    console.log("SPEAKERS JSON FROM NETWORK IMPOSSIBLE TO FETCH");
                    return response;
                } else {
                    console.log("SPEAKERS JSON FROM NETWORK FETCH");
                    return response;
                }
            })
        );
    }/*
    else {
    if(event.request.url == "https://raw.githubusercontent.com/DevInstitut/conference-data/master/sessions.json" 
        || event.request.url == "https://raw.githubusercontent.com/DevInstitut/conference-data/master/speakers.json" ){
    event.respondWith(
            fetch(event.request,{cache:'no-cache'}).then(resp => resp.json())
                .then(speakers => {
                    var store = localforage.createInstance({storeName: dbsepakers});
                    for (key in speakers) {
                        store.setItem(key, speakers[key]);
                    }
                    console.log("*****************MISE A JOUR DATA SPEAKERS*********************");
                }),
                return response;
            })
        )
    }
    else {*/
    event.respondWith(
        caches.match(event.request,{ignoreSearch:'true'}).then(response => {
            if (response) {
                console.log(event.request.url, 'servi depuis le cache');
                return response;
            }
            console.log(event.request.url, 'servi depuis le réseau');
            return fetch(event.request)
        })
        // rubrique à ajouter
        .then(function (response) {
            return caches.open(STATIC_CACHE_NAME).then(cache => {
                // mise en cache des ressources qui ne contiennent pas no.cache
                if (event.request.url.indexOf('.json') < 0) {
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
        })
        .catch(error => {
            console.log();
        })
    );
});

// événement _install_
self.addEventListener('install', event => {
    console.log('Installation du Service Worker...');
    console.log('Mise en cache des ressources');
    event.waitUntil(
    Promise.all([
    caches.open(STATIC_CACHE_NAME)
    .then(cache => {
        return cache.addAll(FILES_TO_CACHE);
    })/*,
    fetch('https://raw.githubusercontent.com/DevInstitut/conference-data/master/speakers.json')
        .then(resp => resp.json())
            .then(speakers => {
                var store = localforage.createInstance({storeName: dbsepakers});
                for (key in speakers) {
                    store.setItem(key, speakers[key]);
                }
                console.log("*****************MISE A JOUR DATA SPEAKERS*********************");
            }),
    fetch('https://raw.githubusercontent.com/DevInstitut/conference-data/master/sessions.json')
        .then(resp => resp.json())
            .then(sessions => {
                var store2 = localforage.createInstance({storeName: dbsessions});
                for (key in sessions) {
                    store2.setItem(key, sessions[key]);
                }
                console.log("*****************MISE A JOUR DATA SESSIONS*********************");
            }),*/
        ])
    );
});