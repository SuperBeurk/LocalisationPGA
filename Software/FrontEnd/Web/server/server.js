const http = require('http');
const WebSocketServer = require('websocket').server;
const server = http.createServer();
var inc = 0;

server.listen(8888);

const wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', function (request) {
  const connection = request.accept(null, request.origin);  //client now connected

  connection.on('message', function (message) {             //Transmission from client received
    var rxStr = message.utf8Data;
    onMessage(rxStr, connection);

  });
  connection.on('close', function (reasonCode, description) {
    console.log('Client has disconnected.');
  });
});


//Message from client to server received. Must handle it after the given command.
//message: the frame received
//connection: the socket corresponding to the webpage client
function onMessage(message, connection) {
  console.log('Received Message:', message);

  if (message == 'The client sends his regards')                //First client-server contact => handshake
    connection.sendUTF('The server also sends his regards');

  var procMessage = message.split(":");
  var command = procMessage[0];
  var value = procMessage[1];
  console.log('command: ' + command + ', value: ' + value);

  inc++;



  //Doit accèder à la database pour ensuite faire le send




  switch (command) {
    case 'read':  sendTag(connection, value, 3+inc, 10, 321);      //Test. Déplace le point de 3 vers la droite à chaque fois

      break;
    case 'hist':
      break;
    default:
  }
}

//Sends a tag information to the client.
//connection: the socket corresponding to the webpage client
//id: the tag id
//posX: first coordinate of the tag
//posY: second coordinate of the tag
//room: the room in which the tag is detected
function sendTag(connection, id, posX, posY, room) {
  var txStr = ('read:' + id + ':' + posX + ':' + posY + ':' + room);
  console.log('Sending: ' + txStr);
  connection.sendUTF(txStr);
}

