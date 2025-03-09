function updateArrows(self){
    if ((self.cursors.left.isDown | self.keyA.isDown) & (self.person.y>200 | self.person.x>200)) {
        self.person.x -= 3;
    } if ((self.cursors.right.isDown | self.keyD.isDown)) {
        self.person.x += 3;
    } if ((self.cursors.up.isDown | self.keyW.isDown) & (self.person.y>200 | self.person.x>200)) {
        self.person.y -= 3;
    } if ((self.cursors.down.isDown | self.keyS.isDown)) {
        self.person.y += 3;
    }
}

function updateSpaceBar(self){
    if (self.spaceBar.isDown) {
        everyoneNotRotating = getEveryoneNotRotating(self)
        if(everyoneNotRotating){
            var i = 0;
            self.totems.getChildren().forEach(totem => {
                if(totem.active){
                    updateConnectionsActivity(self, totem);
                    totem.dataStart = Date.now();
                    totem.rotating = true;
                    totem.listScanned = []
                    self.socket.emit('totemRotated', {i:i, clockwise:totem.clockwise});
                }
                i++
            })
        }
    }
}

function updateFence(self){
    time = 90
    if(Date.now() - self.fence.dataStart > time*1000){
        self.gameover.setTexture("gameover")
        self.gameover.active = true
        self.fence.health.setTexture('none')
    }
    else{
        if(Date.now() - self.fence.dataStart > 30*1000){
            self.fence.setTexture("fence2")
        } else if(Date.now() - self.fence.dataStart > 15*1000){
            self.fence.setTexture("fence1")
        } else if(Date.now() - self.fence.dataStart > 5*1000){
            self.fence.setTexture("fence0")
        }
        if(distance(self.person.x, self.person.y, self.fence.x, self.fence.y) < 200){
            procent = (Date.now() - self.fence.dataStart)/time/10
            if(procent<0){
                procent = 0
            }
            part = 100/6
            num = Math.floor(procent/part)
            self.fence.health.setTexture('health' + num)
        }
        else{
            self.fence.health.setTexture('none')
        }
    }
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if(Date.now() - otherPlayer.fence.dataStart > time*1000){
            self.gameover.setTexture("win")
            self.gameover.active = true
            otherPlayer.fence.health.setTexture('none')
        }
        else{
            if(Date.now() - otherPlayer.fence.dataStart > 30*1000){
                otherPlayer.fence.setTexture("fence2")
            } else if(Date.now() - otherPlayer.fence.dataStart > 15*1000){
                otherPlayer.fence.setTexture("fence1")
            }
        }
    })
}

function updateKeyE(self){
    if (self.keyE.isDown) {
        if(self.plant.active & self.hand.type != 'none'){
            changeType(self.hand, 'none');
            if(self.plant.type<4){
                self.plant.type+=1;
                self.plant.setTexture('plant'+self.plant.type);
                self.socket.emit('playerWatered', 'plant'+self.plant.type);
            }
            else{
                otherPlayer.gameover.setTexture("gameover")
                otherPlayer.gameover.active = true
            }
            
        }
        if(distance(self.person.x, self.person.y, self.fence.x, self.fence.y) < 200 & self.hand.type != 'none'){
            changeType(self.hand, 'none');
            self.fence.dataStart += 20*1000
            self.socket.emit('playerFixed');
        }
        var i = 0;
        self.totems.getChildren().forEach(totem => {
            var j = 0;
            totem.elements.getChildren().forEach(element => {
                if(element.active & !element.used & element.type!='none'){
                    changeType(self.hand, getNameByNum(self, element.type));
                    self.socket.emit('playerPicked', { i:i, j:j, type: element.type});
                    element.type = 0
                    element.setTexture('none');
                    element.used = true;
                }
                j++
            })
            i++
        })
    }
}

function updatePos(self){
    self.physics.world.wrap(self.person, 5);

    self.hand.x = self.person.x+3;
    self.hand.y = self.person.y-5;

    var x = self.person.x;
    var y = self.person.y;
    
    if (self.person.oldPosition && (x !== self.person.oldPosition.x || y !== self.person.oldPosition.y)) {
        self.socket.emit('playerMovement', { x: self.person.x, y: self.person.y});
    }

    self.person.oldPosition = {
        x: self.person.x,
        y: self.person.y,
    };
}

function updateTotems(self){
    self.totems.getChildren().forEach(totem => {
        var goodDistance = distance(self.person.x, self.person.y, totem.x, totem.y)<70
        setActiveTotem(totem, goodDistance);

        holeIds = updateHolesActivity(self, totem);

        if(totem.rotating){
            var timePassed = Date.now() - totem.dataStart;
            var alpha = 360/totem.elements.getChildren().length * rad;
            if(timePassed < totem.time*1000){
                completeRotating(totem, timePassed, alpha);
            }
            else{
                rotate(totem, alpha, holeIds);
            }
        }
    })

}