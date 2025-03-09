function distance(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2)
}
function setActiveTotem(totem, mode){
    var line2 = mode?'Active':'';
    totem.setTexture('totem' + line2);
    totem.active = mode;
}
function setActiveElement(self, element, mode){
    var line2;
    if(element.type == 0){
        line2 = '';
    } else{
        line2 = mode?'Active':'';
    }
    element.setTexture(getNameByNum(self, element.type) + line2);
    element.active = mode;
}
function changeType(element, newType){
    element.type = newType;
    element.setTexture(newType);
}
function hideElement(element){
    element.setTexture('none');
    element.hidden = true;
}
function getNameByNum(self, number){
    return self.dictElements[number]
}
function getEveryoneNotRotating(self){
    var notRotating = true;
    self.totems.getChildren().forEach(totem => {
        if(totem.rotating){
            notRotating = false;
        }
    });
    return notRotating;
}
function makeHole(self, totemId, id){
    const element = self.totems.getChildren()[totemId].elements.getChildren()[id];
    element.hole = true;
    const hole = self.add.sprite(element.x, element.y, 'hole').setOrigin(0.5, 0.5).setDisplaySize(60, 60);
}