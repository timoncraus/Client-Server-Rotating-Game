const rad = Math.PI / 180;

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1000,
    height: 800,
    backgroundColor: '#4488aa',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
 
var game = new Phaser.Game(config);
 
function preload() {
    ['grandfather', 'shadow','circle','element','totem', 'totemActive', 
    'element2', 'none', 'hole', 'elementActive', 'element2Active',
    'plant0', 'plant1', 'plant2', 'plant3', 'plant4', 
    'fence0', 'fence1', 'fence2', 'gameover', 'win',
    'health0', 'health1', 'health2', 'health3', 'health4'].forEach(element => {
        this.load.image(element, `assets/${element}.png`);
    });
}
 
function create() {
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.listCircles = [];
    this.totems = this.physics.add.group();

    this.dictElements = {2:'element2', 1:'element', 0:'none'};
    createCircles(self,
        [{x:300, y:400, radius:150, listElem:[0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1], angle:10, clockwise:1},
        {x:600, y:400, radius:150, listElem:[0, 1, 0, 2, 0, 0, 1, 1, 0, 0, 0], angle:5, clockwise:1},
        {x:240, y:160, radius:95, listElem:[0, 1, 0, 0, 1, 1], angle:17, clockwise:1},
        {x:660, y:160, radius:95, listElem:[0, 1, 0, 0, 1, 1], angle:-17, clockwise:1},
        {x:450, y:610, radius:110, listElem:[2, 0, 1, 1], angle:46, clockwise:1}
    ]);

    makeConnection(self, 2, 4, 0, 2);

    makeConnection(self, 1, 0, 0, 5);
    makeConnection(self, 4, 0, 0, 7);


    makeConnection(self, 3, 5, 1, 3);
    makeConnection(self, 4, 1, 1, 9);

    makeHole(self, 3, 0)
    makeHole(self, 0, 0)

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    listeningCurrentPlayers(self);
    listeningNewPlayer(self);
    listeningDisconnect(self);

    listeningPlayerMoved(self);
    listeningPlayerWatered(self);
    listeningPlayerFixed(self);
    listeningPlayerPicked(self);
    listeningTotemRotated(self);
}

function update() {
    var self = this;
    if (this.person) {
        if(!this.gameover.active){
            updateArrows(self);
            updateSpaceBar(self);
            updateKeyE(self);

            updatePos(self);
            updatePlant(self);
            updateTotems(self);
            updateFence(self);
        }
        
    }
}