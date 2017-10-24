(function(){
    document.addEventListener('deviceready', function() {
      var id = findGetParameter(sessionIdParam);
      db = window.sqlitePlugin.openDatabase({name: 'picturenote.db', location: 'default'});
      db.executeSql('SELECT pic FROM PictureTable WHERE id=(?)', [id], function(rs) {
        var rows = rs.rows;
        for (var i=0; i<rows.length; i++){
            createImgSrc(rows.item(i).pic);
        }
        console.log('pic get from sqlitedb ok');
      }, function(error) {
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });
    });
})();

function addNotes(){
    var id = findGetParameter(sessionIdParam);
    if (typeof(Storage) !== "undefined" && id) {
        localStorage.setItem(id, document.getElementById('note').value);
    } else {
        // Sorry! No Web Storage support..
    }
}

function renderNotesHTML(){
    checkUpdateData().then(function(){
        var id = findGetParameter(sessionIdParam);
        if(id){
            getSessionById(id).then(function(session){
                document.getElementById('title').innerHTML = session.title;
                document.getElementById('sessionlink').setAttribute('href','conference.html?'+sessionIdParam+"="+session.id);
            })
            document.getElementById("note").innerHTML = localStorage.getItem(id);
        }
    });
}
function takePicture(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
    destinationType: Camera.DestinationType.DATA_URL});
}

function takePictureFromPhotoLibrary(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: Camera.DestinationType.DATA_URL});
}

function savePicture(image64){
    var db = null;
    var id = findGetParameter(sessionIdParam);
    document.addEventListener('deviceready', function() {
      db = window.sqlitePlugin.openDatabase({name: 'picturenote.db', location: 'default'});
      db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS PictureTable (id, pic)');
        tx.executeSql('INSERT INTO PictureTable VALUES (?,?)', [id, image64]);
      }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
      }, function() {
        console.log('Populated database OK');
      });
    });
}

function onSuccess(imageData) {
    console.log("Sucess take picture");
    savePicture(imageData);
    createImgSrc(imageData);
}

function onFail(message) {
    alert('Failed because: ' + message);
}

function createImgSrc(imageData){
    var img = document.createElement('img');
    img.src= 'data:image/jpeg;base64,'+imageData;
    img.setAttribute("class","img-responsive center-block");
    document.getElementById("images").appendChild(img);
   // $('#images').html('<img src="data:image/jpeg;base64,'+imageData+'" class="img-responsive center-block">');
}