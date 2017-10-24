const speakerIdParam = "speakerid";

function getAllSpeakers(){
    checkUpdateData().then(function(){
        var store = localforage.createInstance({storeName: "speakers"});
        var ul = document.getElementById('liste');
        store.iterate(function(value, key, iterationNumber) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.setAttribute("href","presentateur.html?"+speakerIdParam+"="+value.id);
            a.innerHTML=value.name;
            li.appendChild(a);
            ul.appendChild(li);
        }).catch(function(err) {
            console.log("getallspeakers error :",err);
        });
    });
}

function getSpeakerById(id){
    var store = localforage.createInstance({storeName: "speakers"});
    return store.getItem(id).then(function(speaker){
        return speaker;
    })
    .catch(function(error) {
        console.log('Une erreur est survenue : ', error);
    });
}

function renderInfoSpeakerById(){
    checkUpdateData().then(function(){
        var store = localforage.createInstance({storeName: "speakers"});
        var id = findGetParameter(speakerIdParam);
        store.getItem(id).then(function(speaker) {
            document.getElementById('name').innerHTML = speaker.name ?  speaker.name : "No Name";
            document.getElementById('shortBio').innerHTML = speaker.shortBio ? speaker.shortBio : "No Biography";
            var newUl = document.createElement('ul');
            document.getElementById('presentations').appendChild(newUl);
            getAllSessionBySpeakerId(id).then(function(sessions){
                sessions.forEach(function(session){
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.setAttribute("href","conference.html?"+sessionIdParam+"="+session.id);
                    a.innerHTML = session.title;
                    li.appendChild(a);
                    newUl.appendChild(li);
                })
            }).catch(function(error) {
                console.log('Une erreur est survenue : ', error);
            });
        });
    });
}
function contactButton(){
    var store = localforage.createInstance({storeName: "contactSpeakers"});
    store.getItem(findGetParameter(speakerIdParam)).then(function(idContactStored){
        if(idContactStored == null) {
            document.getElementById("contactButton").checked = false;
            document.getElementById("labelContactButton").innerHTML = "Ajouter aux contacts";
        } else {
            document.getElementById("contactButton").checked = true;
            document.getElementById("labelContactButton").innerHTML = "Retirer des contacts";
        }
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });
}

function onClickContact(){
    if (document.getElementById('contactButton').checked) 
    {
        addSpeakerInContact();
    } else {
        var store = localforage.createInstance({storeName: "contactSpeakers"});
        store.getItem(findGetParameter(speakerIdParam)).then(function(idContactStored){
            var options      = new ContactFindOptions();
            options.filter   = idContactStored;
            var fields       = [navigator.contacts.fieldType.id];
            navigator.contacts.find(fields, onSuccessFind, onError, options);
        });
    }
}



function onSuccessFind(contact) {
    if(contact[0]){
        contact[0].remove(onSuccessRemove,onError);
    }
}

function onSuccessRemove(){
    var store = localforage.createInstance({storeName: "contactSpeakers"});
    var id = findGetParameter(speakerIdParam);
    store.removeItem(id);
    contactButton();
    alert("Contact remove with Success");
}


function addSpeakerInContact(){
    // create a new contact object
    var contact = navigator.contacts.create();
    getSpeakerById(findGetParameter(speakerIdParam)).then(function(speaker){
        contact.displayName = speaker.name;
        contact.nickname =  speaker.name;         

        // populate some fields
        var name = new ContactName();
        var splitname = speaker.name.split("\\s+");
        name.givenName = splitname[0] || " ";
        name.familyName = splitname[1] || " ";
        contact.name = name;
        if (speaker.socials){
            var urls = [];
            for (var i = 0; i < speaker.socials.length; i++) {
                urls[i] = new ContactField(speaker.socials[i].name, speaker.socials[i].link, false);
            }
            contact.urls = urls;
        }
        contact.note = speaker.bio;

        if(speaker.company) {
            var organizations = [];
            organizations[0] = new ContactOrganization(true,"company",speaker.company,"","");
            contact.organizations = organizations;
        }
        // save to device
        contact.save(onSuccess,onError);
    });
}

function onSuccess(contact) {
    var store = localforage.createInstance({storeName: "contactSpeakers"});
    var id = findGetParameter(speakerIdParam);
    store.setItem(id,contact.id);
    contactButton();
    alert("Contact add with Success");
}

function onError(contactError) {
    alert("Error = " + contactError.code);
}

