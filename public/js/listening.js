function listeningCurrentPlayers(self){
    self.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
            addPlayer(self, players[id]);
        } else {
            addOtherPlayers(self, players[id]);
        }
        });
    });
}
function listeningNewPlayer(self){
    self.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });
}
function listeningDisconnect(self){
    self.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
        }
        });
    });
}
function listeningPlayerMoved(self){
    self.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            otherPlayer.hand.setPosition(playerInfo.x+3, playerInfo.y-5);
        }
        });
    });
}
function listeningPlayerWatered(self){
    self.socket.on('playerWatered', function (playerInfo, plantType) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.hand.type = 'none';
            otherPlayer.hand.setTexture('none');
            otherPlayer.plant.setTexture(plantType);
        }
        });
    });
}
function listeningPlayerPicked(self){
    self.socket.on('playerPicked', function (playerInfo, elementCords) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
            var i = 0;
            self.totems.getChildren().forEach(totem => {
                var j = 0;
                totem.elements.getChildren().forEach(element => {
                    if(i == elementCords.i & j == elementCords.j){
                        element.setTexture('none')
                        element.type = 0
                        changeType(otherPlayer.hand, getNameByNum(self, playerInfo.handType));
                    }
                    j++
                })
                i++
            })
        }
        });
    });
}
function listeningTotemRotated(self){
    self.socket.on('totemRotated', function (totemData) {
        var i = 0;
        self.totems.getChildren().forEach(totem => {
            if(i == totemData.i){
                totem.clockwise = totemData.clockwise;
                totem.connections.forEach(list => {
                    var anotherTotem = list[0];
                    var anotherId = list[1];
                    var anotherElem = anotherTotem.elements.getChildren()[anotherId];
                    hideElement(anotherElem);
                    anotherTotem.connections.forEach(connection => {
                        if(connection[0] == totem){
                            ourElement = connection[0].elements.getChildren()[connection[1]];
                            ourElement.setTexture(getNameByNum(self, ourElement.type));
                        }
                    })
                })
                totem.dataStart = Date.now();
                totem.rotating = true;
            };
            i++
        })
    });
}
function listeningPlayerFixed(self){
    self.socket.on('playerFixed', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.hand.type = 'none';
            otherPlayer.hand.setTexture('none');
            otherPlayer.fence.dataStart += 20*1000
        }
        });
    });
}