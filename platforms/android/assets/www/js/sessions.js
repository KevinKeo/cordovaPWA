const sessionIdParam = "sessionid";

function getAllTitle(){
    checkUpdateData().then(function(){
        var store = localforage.createInstance({storeName: "sessions"});
        var ul = document.getElementById('liste');
        return store.iterate(function(value, key, iterationNumber) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.setAttribute("href","conference.html?"+sessionIdParam+"="+value.id);
            a.innerHTML=value.title;
            li.appendChild(a);
            ul.appendChild(li);
        }).then(function() {
            console.log("ITS OKAY");
        }).catch(function(err) {
            // This code runs if there were any errors
            console.log(err);
        });
    })
}

function renderInfoSessionById(){
    checkUpdateData().then(function(){
        var store = localforage.createInstance({storeName: "sessions"});
        var id = findGetParameter(sessionIdParam);
        store.getItem(id).then(function(session){
        if (session) {
            console.log(session);
            document.getElementById('title').innerHTML = session.title ?  session.title : "No Title";
            document.getElementById('description').innerHTML = session.description ? session.description : "No Description";
            var newUl = document.createElement('ul');
            document.getElementById('presentateurs').appendChild(newUl);
            if(session.speakers){
                session.speakers.forEach(function(speaker) {
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.setAttribute("href","presentateur.html?"+speakerIdParam+"="+speaker);
                    getSpeakerById(speaker).then(function(speakerObject){
                        a.innerHTML = speakerObject.name;
                    });
                    li.appendChild(a);
                    newUl.appendChild(li);
                });
            }
            document.getElementById("linknotes").setAttribute("href","notes.html?"+sessionIdParam+"="+id);
        }});
    })
}

function getAllSessionBySpeakerId(speakerid){
    var sessions = [];
    var store = localforage.createInstance({storeName: "sessions"});
    return store.iterate(function(value, key, iterationNumber) {
        for (var j = 0; value.speakers && j < value.speakers.length; j++){
            if (value.speakers[j] == speakerid) 
            {
                sessions.push(value);
                break;
            }
        }
    }).then(function() {
        return sessions;
    }).catch(function(error) {
        console.log('Une erreur est survenue : ', error);
    });
}

function findGetParameter(parameterName) {
    var param = new URLSearchParams(window.location.search);
    return param.get(parameterName);
}

function getSessionById(id){
    var store = localforage.createInstance({storeName: "sessions"});
    return store.getItem(id);
}