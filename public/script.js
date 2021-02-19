const videoGrid = document.querySelector('.video-grid');
const myVideo = document.createElement('video');
const hamburger = document.querySelector('.hamburger');
const miniMessage = document.querySelector('.mini-message');
const muteBtn = document.querySelector('#muteBtn');
const camBtn = document.querySelector('#camBtn');
const quitBtn = document.querySelector('#quitBtn');
const myScreen = document.createElement('video');
const startCapturebtn = document.querySelector('#startCapturebtn');
const inputMessage = document.querySelector('#inputMessage');
const messageList = document.querySelector('#message-list');
// myVideo.muted = true;
let myVideoStream = null;
let myVideoScreenStream = null;

// on crée une connexion avec notre serveur socket io
const socket = io('/');

// on crée une connexion vers notre serveur peer
const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: port,
    // port: '443',
});
const options = {
    video: true,
    audio: true
};

// cette partie permet d'allumer le camera et le micro de l'utilisateur
// sous forme d'objet qui sera stocket dans une variable `stream` 
navigator.mediaDevices.getUserMedia(options)
.then((stream)=>{
    myVideoStream = stream;
    addVideo(myVideo, stream);
})
.catch((error)=>{
    console.error(error);
});

// la fonction `addvideo` récupére un element html `video` et un `stream`
// pour ensuite l'ajouter dans la liste des videos `videoGrid`
const addVideo = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    });
    videoGrid.append(video);
};

// la fonction `handleNewUser` de créer une connexion avec l'utilisateur qui vient de se connecter `userId`
// il pourra ainsi me voir et m'entendre
const handleNewUser = (userId) => {
    const call = peer.call(userId, myVideoStream);
    const video = document.createElement('video');
    call.on('stream', (remoteStream) => {
        addVideo(video, remoteStream);
    });
};

// cette fonction permet de changer l'icone et la couleur du bouton qui active/désactive le son
const setMute = () => {
    const htmlString = `
        <i class="text-red fas fa-microphone-slash"></i>
        <span class="text-red">désactivé</span>  
    `;
    muteBtn.innerHTML = htmlString;
};
// cette fonction permet de changer l'icone et la couleur du bouton qui active/désactive le son
const setUnMute = () => {
    const htmlString = `
        <i class="fas fa-microphone"></i>
        <span>activé</span>  
    `;
    muteBtn.innerHTML = htmlString;
};

// cette fonction permet de changer l'icone et la couleur du bouton qui allume/éteint la camera
const setPlay = () => {
    const htmlString = `
        <i class="text-red fas fa-video-slash"></i>
        <span class="text-red">éteint</span>
    `;
    camBtn.innerHTML = htmlString;
};

// cette fonction permet de changer l'icone et la couleur du bouton qui allume/éteint la camera
const setStop = () => {
    const htmlString = `
        <i class="fas fa-video"></i>
        <span>allumé</span>
    `;
    camBtn.innerHTML = htmlString;
};

// cette fonction permet d'activer ou de désactiver le son
const muteUnmute = () => {
    // enabled prend la valeur `true` si l'audio est allumé et `false` sinon
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        // On désactive le son
        myVideoStream.getAudioTracks()[0].enabled = false;
        setMute();
    } else {
        //On active le son
        myVideoStream.getAudioTracks()[0].enabled = true;
        setUnMute();
    }
};

// cette fonction permet d'activer ou de d'allumer ou d'eteindre la camera
const playStop = () => {
    // enabled prend la valeur `true` si la camera est allumé et `false` sinon
    const enabled =  myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        // On éteint la camera
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlay();
    } else {
        // On allume la camera
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStop();
    }
};

// cette fonction permet de faire une capture d'écran
const startCapture = async () => {
    let captureStream = null;
    try {
        // dans `captureStream` on a un stream contenant le son et l'image de notre écran ou fenêtre
        captureStream = await navigator.mediaDevices.getDisplayMedia();
        console.log(captureStream);
        addVideo(myScreen, captureStream);
        
    } catch(err) {
      console.error("Error: " + err);
      alert("Erreur lors du partage d'écran réessayez plustard SVP !!");
    }
}



// cette partie permet d'écouter à la création d'une connexion avec le serveur peer
// une fois cela éffectué on rejoint le room `roomId`
peer.on('open', (id)=>{
    socket.emit('join-room', roomId, id);
});

// cette partie permet d'écouter à un appel peer
// si on a reçu un appel on pourra voir et entendre cet utilisateur
// puis on lui envoie notre stream pour qu'il puisse nous voir et entendre
peer.on('call', function(call) {
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', function(remoteStream) {
        addVideo(video, remoteStream);
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
});

// cette partie permet de savoir s'il y a un nouveau utilisateur
socket.on('user-connected', (userId) => {
    handleNewUser(userId);
});

// Quand on recoit un nouveau message on met à jour la liste des messages
socket.on('newMessage', (message) => {
    console.log(message);
    const messageHtml = `<li class="text-white">User: ${message}</li>`;
    messageList.innerHTML += messageHtml;
});

hamburger.addEventListener('click', () => {
    if (miniMessage.style.display === 'flex') {
        miniMessage.style.display = 'none';
    } else {
        miniMessage.style.display = 'flex';
    }
});

muteBtn.addEventListener('click', () => {
    muteUnmute();
});

camBtn.addEventListener('click', () => {
    playStop();
});

quitBtn.addEventListener('click', () => {
    window.location = '/';
});

startCapturebtn.addEventListener('click', () => {
    startCapture();
});

// Au niveau de l'input pour entrer un message
// on attent que l'utilisateur tape sur `entrer` pour envoyer le message
inputMessage.addEventListener('keydown', (event) => {
    if (event.key === 'Enter'  && inputMessage.value) {
        socket.emit('message', inputMessage.value);
        inputMessage.value = '';
    }
});