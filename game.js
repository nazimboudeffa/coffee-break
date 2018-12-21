var player;
var idle, right, left, up, down;
var enemies;
var throwBackArray = [];
var tb = 0;
var m, myGrid;
var moveTween;
var layer;
var playerBread, playerCoffee, playerLeek, playerOnion;
var enemyBread, enemyCoffee, enemyLeek, enemyOnion;
var nbPlayerBreads = 0;
var playerBreadText;

bootState = {
  preload: function() {
    game.load.image("progressBar", "assets/sprites/preloader.png"),
    game.load.image("progressBarBg", "assets/sprites/preloaderbg.png"),
    game.load.image("loader", "assets/sprites/loader.png")
  },
  create: function() {
    game.state.start("load")
  }
},
loadState = {
  init: function(){
    if (!game.device.desktop) {
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      //screen.orientation.lock('landscape');
    }
  },
  preload: function() {
    var a = game.add.image(game.world.centerX, 150, "loader");
    a.anchor.setTo(.5, .5);
    var b = game.add.sprite(game.world.centerX, 200, "progressBarBg");
    b.anchor.setTo(.5, .5);
    var c = game.add.sprite(game.world.centerX, 200, "progressBar");
    c.anchor.setTo(.5, .5);
    game.load.setPreloadSprite(c);

    game.load.tilemap('map', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png', 32, 32);

    game.load.spritesheet('sprite', 'assets/sprites/spritesheet.png', 48, 48);
    game.load.spritesheet('enemy', 'assets/sprites/spritesheet-enemy.png', 48, 48);
    game.load.image('home', 'assets/sprites/home.png');

    game.load.spritesheet('breadA', 'assets/sprites/breadA.png');
    game.load.spritesheet('coffeeA', 'assets/sprites/coffeeA.png');
    game.load.spritesheet('leekA', 'assets/sprites/leekA.png');
    game.load.spritesheet('onionA', 'assets/sprites/onionA.png');

    game.load.spritesheet('breadB', 'assets/sprites/breadB.png');
    game.load.spritesheet('coffeeB', 'assets/sprites/coffeeB.png');
    game.load.spritesheet('leekB', 'assets/sprites/leekB.png');
    game.load.spritesheet('onionB', 'assets/sprites/onionB.png');

    game.load.bitmapFont('desyrel', 'assets/fonts/desyrel.png', 'assets/fonts/desyrel.xml');

    game.load.image('learn', 'assets/sprites/learn.png');
    game.load.image('phaser2', 'assets/sprites/phaser2.png');

    game.load.image('cod', 'assets/pics/cod.jpg');
    game.load.image('spacebar', 'assets/buttons/spacebar.png');
    game.load.image('fight', 'assets/buttons/fight.png');
    game.load.image('okey', 'assets/buttons/okey.png');
  },
  create: function() {
    game.state.start("splash")
  }
},
splashState = {
  create: function() {
    var pic = game.add.image(game.world.centerX, game.world.centerY, 'learn');
    pic.anchor.set(0.5);
    pic.alpha = 0.1;
    //  This tween will wait 0 seconds before starting
    var tween = game.add.tween(pic).to( { alpha: 1 }, 3000, "Linear", true, 0);
    tween.onComplete.add(this.startMenu, this)
  },
  startMenu: function() {
    game.state.start("menu")
  }
},
menuState = {
  create: function() {
    game.add.sprite(0, 0, 'cod');

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    var sBar = game.add.button(game.world.centerX, game.world.centerY, 'spacebar', this.start);
    sBar.anchor.setTo(0.5, 0.5);
    sBar.alpha = 0;
    var tween = game.add.tween(sBar).to( { alpha: 1 }, 500, "Linear", true, 0, -1);
    tween.yoyo(true, 500);
  },
  update: function() {
    if (spaceKey.isDown){
      game.state.start('play');
    }
  },
  start: function(){
    game.state.start('play');
  }
},
playState = {
  create: function() {
    this.playerMap = {};
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

    game.world.setBounds(0, 0, 1024, 768);

    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file

    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    };

    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    layer.events.onInputUp.add(this.getCoordinates, this);

    game.physics.startSystem(Phaser.Physics.ARCADE);

    m = game.cache.getTilemapData('map').data.layers[0].data;
    myGrid = new Array();
    for(i=0; i<31; i++){
      myGrid[i] = new Array();
      for(j=0; j<32; j++){
        myGrid[i].push(m[i*j]);
      }
    }

    easystar.setGrid(myGrid);
    easystar.setAcceptableTiles([11]);

    this.addPlayer(100, 350);

    //  Here we create 2 new groups

    enemies = game.add.group();
/*
    for (var i = 0; i < 10; i++)
    {
        //  This creates a new Phaser.Sprite instance within the group
        //  It will be randomly placed within the world and use the 'baddie' image to display
        this.addEnemies(Math.random() * 1024, Math.random() * 768);
    };
*/
    this.addEnemies(500, 300);

    home = game.add.sprite(0, 20, 'home');
    game.physics.arcade.enable(home);

    //throwback
    tBack = game.add.sprite(320, 240, 'learn');
    tBack.anchor.setTo(0.5, 0.5);
    tBack.alpha = 0;
    tBack.fixedToCamera = true;
  },
  update: function() {
    game.physics.arcade.overlap(player, enemies, this.collisionHandler, null, this);
    game.physics.arcade.overlap(player, home, this.collisionHome, null, this);
  },

  collisionHandler : function(){
    //game.add.tween(tBack).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    moveTween.stop();
    game.state.start("battle");
  },

  collisionHome : function(){
    game.state.start("home");
  },

  getCoordinates : function(layer, pointer){
    this.movePlayer(pointer.worldX, pointer.worldY);
    //this.movePlayer2(pointer.worldX, pointer.worldY);
  },

  addPlayer : function(x, y){
    player = game.add.sprite(x, y, 'sprite', 0);
    player.smoothed = false;
    game.physics.arcade.enable(player);

    idle = player.animations.add('idle', [0], 10, true);
    right = player.animations.add('right', [7, 8, 9, 10, 11, 12], 10, true);
    left = player.animations.add('left', [15, 16, 17, 18, 19, 20], 10, true);
    up = player.animations.add('up', [21, 22], 10, true);

    player.ismoving = false;

    game.camera.follow(player);
  },

  addEnemies : function(x, y){
    enemy = game.add.sprite(x, y, 'enemy', 0);
    enemy.smoothed = false;
    game.physics.arcade.enable(enemy);
    enemies.add(enemy);
  },

  movePlayer : function(x, y){
    var i = 0;
    function moveObject(object, p, s){
      var StepX = p[i].x || false, StepY = p[i].y || false;
      moveTween = game.add.tween( object ).to({ x: StepX*32, y: StepY*32}, 150);
      moveTween.start();
      dx = p[i].x;
      moveTween.onComplete.add(function(){
        i++;
        if(i < p.length){
          console.log(p[i]);
          console.log(p[i+1]);
          if (p[i].x > dx) {
            player.play('right');
          };
          if (p[i].x < dx) {
            player.play('left');
          };
          if (p[i].x == dx) {
            player.play('up');
          };
          moveObject(object, p);
        }else{
          player.play('idle');
        };
      })
    }

    easystar.findPath(Math.floor(player.x/32), Math.floor(player.y/32), Math.floor(x/32), Math.floor(y/32), function( path ) {
      if (path === null) {
        console.log("Path was not found.");
    	} else {
        console.log("Path was found.");
        throwBackArray.push(path);
        tb = tb + 1;
        if (player.ismoving == false){
          console.log("is not moving");
          player.ismoving = true;
          moveObject(player, path);
        } else {
          console.log("is moving");
          player.ismoving = false;
          moveTween.stop();
          player.play('idle');
        }
    	}
    });
    easystar.calculate();
  }

},
battleState = {
  create: function(){
    this.createPlayerCreatures();
    this.createEnemyCreatures();
    fight = game.add.button(game.world.centerX, game.world.centerY + 200, 'fight', this.attack);
    fight.anchor.setTo(.5,.5);
  },
  createPlayerCreatures: function(){
    playerBread = game.add.image(100, 70, 'breadA');
    playerBread.anchor.setTo(.5,.5);
    playerBreadText = game.add.bitmapText(playerBread.x + 100, playerBread.y, 'desyrel', nbPlayerBreads, 64);
    playerCoffee = game.add.image(100, 170, 'coffeeA');
    playerCoffee.anchor.setTo(.5,.5);
    playerLeek = game.add.image(100, 270, 'leekA');
    playerLeek.anchor.setTo(.5,.5);
    playerOnion = game.add.image(100, 370, 'onionA');
    playerOnion.anchor.setTo(.5,.5);
  },
  createEnemyCreatures: function(){
    enemyBread = game.add.image(500, 70, 'breadB');
    enemyBread.anchor.setTo(.5,.5);
    enemyCoffee = game.add.image(500, 170, 'coffeeB');
    enemyCoffee.anchor.setTo(.5,.5);
    enemyLeek = game.add.image(500, 270, 'leekB');
    enemyLeek.anchor.setTo(.5,.5);
    enemyOnion = game.add.image(500, 370, 'onionB');
    enemyOnion.anchor.setTo(.5,.5);
  },
  attack: function(){
    game.add.tween(playerBread).to( { x: game.world.centerX }, 4000, Phaser.Easing.Bounce.Out, true);
    game.add.tween(enemyBread).to( { x: game.world.centerX }, 4000, Phaser.Easing.Bounce.Out, true);
    game.add.tween(playerCoffee).to( { x: game.world.centerX }, 3000, Phaser.Easing.Bounce.Out, true);
    game.add.tween(enemyCoffee).to( { x: game.world.centerX }, 3000, Phaser.Easing.Bounce.Out, true);
    game.add.tween(playerLeek).to( { x: game.world.centerX }, 2000, Phaser.Easing.Bounce.Out, true);
    game.add.tween(enemyLeek).to( { x: game.world.centerX }, 2000, Phaser.Easing.Bounce.Out, true);
    game.add.tween(playerOnion).to( { x: game.world.centerX }, 1000, Phaser.Easing.Bounce.Out, true);
    game.add.tween(enemyOnion).to( { x: game.world.centerX }, 1000, Phaser.Easing.Bounce.Out, true);
  }
},
homeState = {
  create: function(){
    nbPlayerBread = 20;
    playerBread = game.add.image(100, 70, 'breadA');
    playerBread.anchor.setTo(.5,.5);
    playerBreadText = game.add.bitmapText(playerBread.x + 100, playerBread.y, 'desyrel', nbPlayerBreads, 64);
    playerCoffee = game.add.image(100, 170, 'coffeeA');
    playerCoffee.anchor.setTo(.5,.5);
    playerLeek = game.add.image(100, 270, 'leekA');
    playerLeek.anchor.setTo(.5,.5);
    playerOnion = game.add.image(100, 370, 'onionA');
    playerOnion.anchor.setTo(.5,.5);

    okey = game.add.button(game.world.centerX, game.world.centerY + 200, 'okey', this.back);
    okey.anchor.setTo(.5,.5);
  },
  back: function(){
    game.state.start("play");
  }
},
winState = {
  create: function() {
    youWin = game.add.sprite(320, -200, 'phaser2');
    youWin.anchor.setTo(0.5, 0.5);
    //youWin.alpha = 0;
    //youWin.fixedToCamera = true;
    var tween = game.add.tween(youWin).to( { y: 240 }, 3000, Phaser.Easing.Bounce.Out, true);
    //var tween = game.add.tween(youWin).to( { alpha: 1 }, 2000, "Linear", true, 0, 5);
    tween.onComplete.add(this.startMenu, this)
  },
  startMenu: function() {
    game.state.start("menu")
  }
},

game = new Phaser.Game(640, 640);
var easystar = new EasyStar.js();
game.state.add("boot", bootState),
game.state.add("load", loadState),
game.state.add("splash", splashState),
game.state.add("menu", menuState),
game.state.add("play", playState),
game.state.add("battle", battleState),
game.state.add("home", homeState),
game.state.add("win", winState),
game.state.start("boot");
