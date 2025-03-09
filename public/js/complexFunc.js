function addPlayer(self, playerInfo) {
    self.person = self.physics.add.image(playerInfo.x, playerInfo.y, 'grandfather').setOrigin(0.5, 0.5).setDisplaySize(60, 90);
    self.hand = self.physics.add.image(playerInfo.x + 3, playerInfo.y - 5, 'none').setOrigin(0.5, 0.5).setDisplaySize(30, 30);
    self.plant = self.physics.add.image(playerInfo.plantX, playerInfo.plantY, 'plant0').setOrigin(0.5, 0.5).setDisplaySize(60, 100);
    self.plant.type = 0;
    self.plant.active = false;
    self.fence = self.physics.add.image(playerInfo.fenceX, playerInfo.fenceY, 'fence0').setOrigin(0.5, 0.5).setDisplaySize(180, 150);
    self.fence.health = self.physics.add.image(playerInfo.fenceX, playerInfo.fenceY-50, 'none').setOrigin(0.5, 0.5).setDisplaySize(100, 30);
    self.fence.dataStart = Date.now();
    self.gameover = self.physics.add.image(500, 400, 'none').setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    self.gameover.active = false
}
function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'shadow').setOrigin(0.5, 0.5).setDisplaySize(60, 90);
    otherPlayer.hand = self.physics.add.image(playerInfo.x + 3, playerInfo.y - 5, playerInfo.type).setOrigin(0.5, 0.5).setDisplaySize(20, 20);
    otherPlayer.hand.type = playerInfo.type;
    otherPlayer.plant = self.physics.add.image(playerInfo.plantX, playerInfo.plantY, 'plant0').setOrigin(0.5, 0.5).setDisplaySize(60, 100);
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.fence = self.physics.add.image(playerInfo.fenceX, playerInfo.fenceY, 'fence0').setOrigin(0.5, 0.5).setDisplaySize(180, 150);
    otherPlayer.fence.health = self.physics.add.image(playerInfo.fenceX, playerInfo.fenceY-50, 'none').setOrigin(0.5, 0.5).setDisplaySize(100, 30);
    otherPlayer.fence.dataStart = Date.now();
    self.otherPlayers.add(otherPlayer);
}

function createCircles(self, list){
    list.forEach(obj => {
        const circle = self.add.sprite(obj.x, obj.y, 'circle').setOrigin(0.5, 0.5).setDisplaySize(obj.radius*2, obj.radius*2);
    })
    let m=0;
    list.forEach(obj => {
        const totem = self.add.sprite(obj.x, obj.y, 'totem').setOrigin(0.5, 0.5).setDisplaySize(50, 50);
        totem.Aidi = m
        totem.countTurns = 0;
        totem.elements = self.physics.add.group();
        totem.radius = obj.radius;
        totem.time = 1;
        totem.clockwise = obj.clockwise;
        totem.active = false;
        totem.rotating = false;
        totem.connections = [];
        var alpha = 360/obj.listElem.length * rad;
        var extraAngle = rad * obj.angle;
        totem.extraAngle = extraAngle;
        let n = 0;
        for(var i=0; i<obj.listElem.length; i++){
            elemX = obj.x - Math.cos(alpha * i + extraAngle).toFixed(2) * obj.radius;
            elemY = obj.y - Math.sin(alpha * i + extraAngle).toFixed(2) * obj.radius;
            var element = self.add.sprite(elemX, elemY, getNameByNum(self, obj.listElem[i])).setOrigin(0.5, 0.5).setDisplaySize(30, 30);
            element.type = obj.listElem[i];
            element.Aidi = n;
            element.hidden = false;
            element.hole = false;
            element.active = false;
            element.used = false;
            totem.elements.add(element);
            n++
        }
        self.totems.add(totem);
        m++
    })
}

function makeConnection(self, totemId1, id1, totemId2, id2){
    var totem1 = self.totems.getChildren()[totemId1];
    var elem1 = totem1.elements.getChildren()[id1];
    var totem2 = self.totems.getChildren()[totemId2];
    var elem2 = totem2.elements.getChildren()[id2];
    elem1.setTexture('none');
    elem1.hidden = true;
    elem1.type = elem2.type;
    totem1.connections.push([totem2, id2]);
    totem2.connections.push([totem1, id1]);
}

function updateConnectionsActivity(self, totem){
    totem.connections.forEach(list => {
        var anotherTotem = list[0];
        var anotherId = list[1];
        var anotherElem = anotherTotem.elements.getChildren()[anotherId];
        anotherElem.setTexture('none');
        anotherElem.hidden = true;
        anotherTotem.connections.forEach(connection => {
            if(connection[0] == totem){
                ourElement = connection[0].elements.getChildren()[connection[1]];
                ourElement.setTexture(getNameByNum(self, ourElement.type));
            }
        })
        
    })
}
function updatePlant(self){
    self.plant.active = distance(self.person.x, self.person.y, self.plant.x, self.plant.y)<70;
}

function rotate(totem, alpha){
    totem.rotating = false;
    totem.extraAngle -= alpha * totem.clockwise;
    if(totem.extraAngle < 0){
        totem.extraAngle = Math.PI*2 + totem.extraAngle;
    }

    totem.countTurns++;
    if(totem.countTurns>=totem.elements.getChildren().length){
        totem.countTurns = 0;
    }
    
    updatingConnections(totem);
    updatingHolesPos(totem, holeIds);
}  
function updatingConnections(totem){
    totem.listScanned = []
    totem.connections.forEach(list => {
        var anotherTotem = list[0];
        var anotherId = list[1];
        var anotherElem = anotherTotem.elements.getChildren()[anotherId];
        //console.log("--")
        anotherTotem.connections.forEach(connection => {
            if(connection[0] == totem){
                //console.log(anotherTotem.Aidi, connection[1])  
                connection[1] += totem.clockwise;    
                
                var ourLength = totem.elements.getChildren().length;
                if(connection[1] < 0){
                    connection[1] = ourLength - 1;
                }
                else if(connection[1] >= ourLength){
                    connection[1] = 0;
                }
                var ourType = totem.elements.getChildren()[connection[1]].type;
                anotherElem.type = ourType;
                anotherElem.used = false;
            }
        })
    })
}
function updatingHolesPos(totem, holeIds){
    console.log(holeIds)
    for(var i=0; i<holeIds.length; i++){
        console.log(i + totem.clockwise * totem.countTurns)
        idNew = i + totem.clockwise * totem.countTurns
        if(idNew<0){
            idNew = totem.elements.getChildren().length -1
        } else if(idNew >= totem.elements.getChildren().length){
            idNew = 0
        }
        totem.elements.getChildren()[idNew].hole = true

        idLast = idNew - totem.clockwise
        if(idLast<0){
            idLast = totem.elements.getChildren().length -1
        } else if(idLast >= totem.elements.getChildren().length){
            idLast = 0
        }
        totem.elements.getChildren()[idLast].hole = false
        
    }
}

function updateHolesActivity(self, totem){
    var holeIds = [];
    var i = 0;
    totem.elements.getChildren().forEach(element => {
        if(element.hole){
            holeIds.push(i);
            var goodConditions = distance(self.person.x, self.person.y, element.x, element.y)<70 & !totem.rotating;
            setActiveElement(self, element, goodConditions);
        }
        i++
    })
    return holeIds
}

function completeRotating(totem, timePassed, alpha){
    var i = 0;
    totem.elements.getChildren().forEach(element => {
        var currentAngle = alpha * i + totem.extraAngle - totem.clockwise * alpha * (timePassed/totem.time/1000);
        element.x = totem.x - Math.cos(currentAngle) * totem.radius;
        element.y = totem.y - Math.sin(currentAngle) * totem.radius;
        i++
    })
}