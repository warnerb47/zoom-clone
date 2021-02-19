const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4:uuidv4 } = require('uuid');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
const port = 5000;

// Pour qu’Express puisse afficher le rendu des fichiers modèles
// il faut lui préciser que l'on utilise ejs
// https://expressjs.com/fr/guide/using-template-engines.html
app.set('view engine', 'ejs');

// Pour servir des fichiers statiques
// tels que les images, les fichiers CSS et les fichiers JavaScript,
// utilisez la fonction de logiciel intermédiaire intégré express.static dans Express
// https://expressjs.com/fr/starter/static-files.html
app.use(express.static('public'));

// On utilise un serveur peer sur `/peerjs`
// Utilisation de middleware
// https://expressjs.com/fr/guide/using-middleware.html
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/newMeet', (req, res) => {
    res.redirect('/'+uuidv4());
});

app.get('/:room', (req, res)=>{
    res.render('room', { roomId: req.params.room, port: port });
});

// on écoute les événements avec socket io
io.on('connection', (socket)=>{
    socket.on('join-room', (roomId, userId)=>{
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
        
        socket.on('message', (message) => {
            io.to(roomId).emit('newMessage', message);
        });
    });
});


server.listen(port, ()=>{
    console.log('visit http://localhost:5000');
})