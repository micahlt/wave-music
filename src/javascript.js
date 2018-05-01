drawerState = {
    startPos:null,
    open:false,
    mouseDown:false
};
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
        .then(function(swReg) {
            console.log('Service Worker is registered', swReg);
            swRegistration = swReg;
        })
        .catch(function(error) {
            console.error('Service Worker Error', error);
        });
            
    });
};
colours = [
    ["#1675d1", "#00796b"],
    ["#fbc02d", "#689f38"],
    ["#e53935", "#ffa000"],
    ["#7b1fa2", "#303f9f"],
    ["#546e7a", "#00acc1"]
]
Number.prototype.toNearest = function (n) {
    return Math.floor(this/n) * n;
};
Number.prototype.into = function (n) {
    return this - this.toNearest(n);
};
app = {
    clientID:'11d7272e7a9e45b2aa6f3b5bc76775c0',
    redirect_uri: window.location.href
};
const drawer = document.querySelector('#bottomBar');

function mouseDown(ev){
    if (ev.type == "touchstart") {
        drawerState.startPos = [ev.touches[0].clientX, ev.touches[0].clientY];
    } else {
        drawerState.startPos = [ev.clientX, ev.clientY];
    };
    drawerState.mouseDown = true;
    drawer.classList.toggle('smooth', false);
}

function drag(ev){
    if(drawerState.mouseDown){
        ev.preventDefault();
        if (ev.type == "touchmove") {
            drawer.style.setProperty('--drag', `${Math.round(ev.touches[0].clientY - drawerState.startPos[1])}px`);
        } else {
            drawer.style.setProperty('--drag', `${Math.round(ev.clientY - drawerState.startPos[1])}px`);
        };
        drawerState.prevPos = [ev.pageX, ev.pageY];
    };
}

function mouseUp(ev){
    if(drawerState.mouseDown = true){
        drawer.classList.toggle('smooth', true);
        if (drawerState.open) {
            drawer.style.setProperty('--drag', `0px`);drawerState.open = false;
        } else {
            drawer.style.setProperty('--drag', `-75%`);drawerState.open = true;
        }
        drawerState.mouseDown = false;
    }
}

function play(_play) {
    if (_play) {
        /*document.addEventListener('mouseup', mouseUp);
        document.addEventListener('touchend', mouseUp);
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, {passive: false});
        drawer.addEventListener('mousedown', mouseDown);
        drawer.addEventListener('touchstart', mouseDown);*/
        drawer.classList.toggle('playing', true);
    } else {
        /*document.removeEventListener('mouseup', mouseUp);
        document.removeEventListener('touchend', mouseUp);
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag, {passive: false});
        drawer.removeEventListener('mousedown', mouseDown);
        drawer.removeEventListener('touchstart', mouseDown);*/
        drawer.classList.toggle('playing', false);
    }
};

function setPage(page) {
    window.location.href = "#" + page;
}

var songList = [];
function populateSongs() {
    const $songs = e('#songs');
    $songs.innerHTML = `<h1><i class="material-icons" onclick="setPage('')">arrow_back</i> Songs</h1><h2>Upload a Song: <button onclick="uploadFile()">Upload</button><hr></h2>`;
    var transaction = db.transaction(["songs"]);
    var objectStore = transaction.objectStore("songs");
    var request = objectStore.getAll();
    request.onerror = function(event) {
        new dialog ('Error', 'Error: ' + event.target.errorCode);
    };
    request.onsuccess = function(event) {
        let songs = request.result;
        songList = request.result;
        for (let i = 0; i < songs.length; i++) {
            newSongcard(songs[i], i);
        };
    };
}

function playSong() {
    console.log(this.id);
    var transaction = db.transaction(["songs"]);
    var objectStore = transaction.objectStore("songs");
    var titleIndex = objectStore.index('title'); 
    var request = titleIndex.getKey(this.id);
    request.onsuccess = function() {
        console.log(request.result);
        var req2 = objectStore.get(request.result);
        req2.onsuccess = function(event) {
            console.log(req2.result);
            e('#audioControls').src = req2.result.data;
            e('#bottomBar > p').innerText = req2.result.title;
        play(true);
        };
    };
}

function linkToSpotify() {
    var scopes = 'user-read-private streaming playlist-read-private user-library-read';
    window.location.href = 'https://accounts.spotify.com/authorize' + '?response_type=code' + '&client_id=' + app.clientID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') + '&redirect_uri=' + encodeURIComponent(app.redirect_uri);
};

function uploadFile() {
    let upload = new elem ('input', {type:"file",accept:"audio/*"});
    document.body.appendChild(upload);
    upload.addEventListener('change', storeFile);
    upload.click();
    document.body.removeChild(upload);
    
};
function storeFile(ev) {
    var file = this.files[0];
    //console.log(file);
    e('#songInfoOverlay').setAttribute('open', '');
    e('#songInfoOverlay p').innerHTML = `Name: <input id="name" value="${file.name.split('.')[0]}"><br>Size: ${file.size}<br>Artist: <input id="artist" value="Unknown"><br>Album: <input id="album" value="Unknown"><br>Image: <input id="image" type="file">`;
    let upload = new elem ('button', {innerText:"Upload"});
    upload.addEventListener('click', function(){dbFile(file)});
    e('#songInfoOverlay div')[0].appendChild(upload);
    let cancel = new elem ('button', {innerText:"Cancel"});
    cancel.addEventListener('click', function(){
        e('#songInfoOverlay').removeAttribute('open');
        e('#songInfoOverlay div')[0].innerHTML = "<h2>Song<hr></h2><p></p>";
    });
    e('#songInfoOverlay div')[0].appendChild(cancel);
}
function dbFile(file) {
    let reader  = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", function () {
        var art = e('#songInfoOverlay #image').files[0];
        if (art) {
            var image = new FileReader();
            image.addEventListener("load", function () {
                storeSong(reader.result, image.result);
            }, false);
            image.readAsDataURL(art);
        } else {
            storeSong(reader.result);
        };
    }, false);
};

function storeSong(song, image) {
    if (image) {
        var fileInfo = {title:e('#songInfoOverlay #name').value,album:e('#songInfoOverlay #album').value,artist:e('#songInfoOverlay #artist').value,image:image,data:song};
    } else {
        var fileInfo = {title:e('#songInfoOverlay #name').value,album:e('#songInfoOverlay #album').value,artist:e('#songInfoOverlay #artist').value,image:null,data:song};
    };
    var transaction = db.transaction(["songs"], "readwrite");
    transaction.oncomplete = function(event) {
        e('#songInfoOverlay').removeAttribute('open');
        e('#songInfoOverlay div')[0].innerHTML = "<h2>Song<hr></h2><p></p>";
        songList.push(fileInfo);
        newSongcard(fileInfo , songList.length-1);
    };

    transaction.onerror = function(event) {
        new dialog ('Error', 'Error: ' + event.target.errorCode);
    };
    var objectStore = transaction.objectStore("songs");
    var request = objectStore.add(fileInfo);
    request.onsuccess = function(event) {
    };
};

function newSongcard(fileInfo, id) {
    let card = new elem ('div', {className:"item",id:fileInfo.title,style:`--grad-start:${colours[id.into(colours.length)][0]};--grad-end:${colours[id.into(colours.length)][1]};`,children:[
        new elem ('i', {innerText:"more_vert",className:"material-icons moreButton"}),
        new elem ('h2', {innerText:fileInfo.title}),
        new elem ('p', {innerText:`Artist: ${fileInfo.artist} Album: ${fileInfo.album}`})
    ]});
    if (fileInfo.image != null) {
        card.style = `--grad-start:${colours[id.into(colours.length)][0]};--grad-end:${colours[id.into(colours.length)][1]};background: linear-gradient(to right, var(--grad-start), var(--grad-end), rgba(0, 0, 0, 0)), url(${fileInfo.image}) no-repeat;`
    };
    card.addEventListener('click', playSong);
    e('#songs').appendChild(card);
}

class dialog {
    constructor(_title, _body, _actions) {
        if (!_actions) {
            var _actions = [{text:"cancel",action:function(){document.body.removeChild(e('#dialogOverlay'))}}]
        };  
        var actionElems = new Array();
        for (let i = 0; i < _actions.length; i++) {
            actionElems.push(new elem ('button', {onclick:_actions[i].action,innerText:_actions[i].text}));
        }
        let alert = new elem ('div', {id:"dialogOverlay",className:"dialogContainer",children:[
            new elem ('div', {className:"dialog",children:[
                new elem ('h2', {innerHTML:`${_title}<hr>`}),
                new elem ('p', {innerText:_body}),
                new elem ('hr')
            ]}),
            new elem ('div', {className:"bgeffect"})
        ]});
        for (let i = 0; i < actionElems.length; i++) {
            console.log(actionElems);
            alert.querySelector('.dialog').appendChild(actionElems[i]);
        };
        alert.setAttribute('open', '');
        document.body.appendChild(alert);

    }
}
var db;
var request = window.indexedDB.open("wave", 1);
request.onupgradeneeded = function(event) { 
  var db = event.target.result;
  var objectStore = db.createObjectStore("songs", {autoIncrement : true});
  objectStore.createIndex("title", "title", { unique: true });
  objectStore.createIndex("artist", "artist", { unique: false });
  objectStore.createIndex("album", "album", { unique: false });
};
request.onerror = function(event) {
    new dialog ('Error', 'Error: ' + event.target.errorCode);
    return false;
};
request.onsuccess = function(event) {
    console.log('IndexedDB Success!');
    db = event.target.result;
    populateSongs();
};