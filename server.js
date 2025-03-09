var express = require('express');
var app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server);
var players = {};
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
 
io.on('connection', function (socket) {
  console.log('подключился пользователь');
    // создание нового игрока и добавление го в объект players
  if(Object.keys(players).length == 0){
    players[socket.id] = {
      x: Math.floor(Math.random() * 700) + 50,
      y:  Math.floor(Math.random() * 700) + 50,
      plantX: 500,
      plantY: 500,
      fenceX: 100,
      fenceY: 100,
      handType: 'none',
      playerId: socket.id
    };
  }
  else{
    players[socket.id] = {
      x:  Math.floor(Math.random() * 700) + 50,
      y:  Math.floor(Math.random() * 700) + 50,
      plantX: 400,
      plantY: 500,
      fenceX: 100,
      fenceY: 600,
      handType: 'none',
      playerId: socket.id
    };
  }
  // отправляем объект players новому игроку
  socket.emit('currentPlayers', players);
  // обновляем всем другим игрокам информацию о новом игроке
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', function () {
    console.log('пользователь отключился');
    // удаляем игрока из нашего объекта players 
    delete players[socket.id];
    // отправляем сообщение всем игрокам, чтобы удалить этого игрока
    socket.disconnect()
  });

  // когда игроки движутся, то обновляем данные по ним
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // отправляем общее сообщение всем игрокам о перемещении игрока
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
  socket.on('playerPicked', function (pickingData) {
    players[socket.id].handType = pickingData.type;
    elementCords = {
      i: pickingData.i,
      j: pickingData.j
    }
    socket.broadcast.emit('playerPicked', players[socket.id], elementCords);
  });
  socket.on('totemRotated', function (totemData) {
    socket.broadcast.emit('totemRotated', totemData);
  });
  socket.on('playerWatered', function (plantType) {
    players[socket.id].handType = 'none';
    socket.broadcast.emit('playerWatered', players[socket.id], plantType);
  });
  socket.on('playerFixed', function () {
    players[socket.id].handType = 'none';
    socket.broadcast.emit('playerFixed', players[socket.id]);
  });
});

server.listen(8081, function () {
  console.log(`Прослушиваем ${server.address().port}`);
});