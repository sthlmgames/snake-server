

const app = require('express')();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

class BodyPart {
    constructor() {
        this._x = 0;
        this._y = 0;
    }
}

class Player {
    constructor (id, socket) {
        this._socket = socket;
        this._id = id;
        this._bodyParts = [];
        this.expandBody();
        setTimeout(() => {
          this.expandBody();
        }, 3000)
    }

    expandBody() {
         this._bodyParts.push(new BodyPart());
         this._socket.emit('server-message', {
           player: this._bodyParts
         });
         console.log(this);
    }
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, 'localhost', function() {
    console.log("listening on *:" + port);
});

io.on('connection', function(socket){
  const player = new Player(socket.id, socket);
  console.log('a user connected');
});