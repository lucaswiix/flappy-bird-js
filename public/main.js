const config = {
  width: 400,
  height: 490,
  velocity: -350,
  backgroundColor: '#71c5cf',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300,
      },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const assets = {
  bird: 'assets/bird.png',
  brick: 'assets/pipe.png',
  ground: 'assets/ground-sprite.png',
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('bird', assets.bird);
  this.load.image('brick', assets.brick);
  this.load.spritesheet('ground', 'assets/ground-sprite.png', {
    frameWidth: config.width,
    frameHeight: 112,
  });
  this.load.image('restart', 'assets/restart-button.png');
}

let player;
let brick;
let gameOver;
let pipesGroup;
let scene;
let restartMessage;
let score;
let labelScore;

function addOnePipe(x, y) {
  const pipe = this.physics.add.sprite(x, y, 'brick');
  pipe.body.allowGravity = false;
  pipesGroup.add(pipe);
  pipe.checkWorldBounds = true;
  pipe.outOfBoundsKill = true;
}

function addRowOfPipes() {
  const hole = Math.floor(Math.random() * 5) + 1;
  score += 1;
  labelScore.text = score;
  for (let i = 0; i < 8; i++) {
    if (i != hole && i != hole + 1) {
      if (gameOver) return;

      const pipe = pipesGroup.create(400, i * 60 + 10, 'pipe');
      pipe.body.allowGravity = false;
    }
  }
}

function create() {
  scene = this;
  pipesGroup = this.physics.add.group();
  player = this.physics.add.sprite(100, 245, 'bird');
  player.body.gravity.y = 500;
  player.setCollideWorldBounds(true);
  const spaceKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );

  ground = this.physics.add.sprite(144, 458, 'ground');
  ground.setCollideWorldBounds(true);
  ground.setDepth(10);

  this.physics.add.collider(player, pipesGroup, hitBird, null, this);
  this.physics.add.collider(player, ground, hitBird, null, this);
  this.timer = this.time.scene.time.addEvent({
    delay: 1500, // ms
    callback: addRowOfPipes,
    callbackScope: this,
    loop: true,
  });
  spaceKey.on('down', jump);

  restartText = this.add.text(100, 235, 'Perdeu amigão', {
    font: '30px Arial',
    fill: '#ffffff',
    backgroundColor: '#FF5E00',
    fontWeight: 'bold',
    padding: {
      left: 5,
      right: 5,
      top: 5,
      bottom: 5,
    },
    shadow: {
      offsetX: 0,
      offsetY: 0,
      color: '#000',
      blur: 5,
      stroke: false,
      fill: true,
    },
  });
  restartText.visible = false;

  restartButton = this.add.image(200, 300, 'restart').setInteractive();
  restartButton.on('pointerdown', restart);
  restartButton.setDepth(20);
  restartButton.visible = false;

  labelScore = this.add.text(20, 20, '0', {
    font: '30px Arial',
    fill: '#ffffff',
  });
}

function update() {
  if (player.y < 0 || player.y > config.height) {
    restart();
  }

  if (gameOver) {
    return;
  }

  if (player.angle < 20) {
    player.angle += 1;
  }

  pipesGroup.children.iterate(function (child) {
    if (child == undefined) return;

    if (child.x <= 0) child.destroy();
    else child.setVelocityX(-150);
  });
}

function hitBird(player) {
  this.physics.pause();

  gameOver = true;
  restartButton.visible = true;
  restartText.visible = true;
}

function jump() {
  if (gameOver) {
    return;
  }

  player.setVelocityY(-300);
  player.angle = -15;
}

function restart() {
  pipesGroup.clear(true, true);
  pipesGroup.clear(true, true);
  player.destroy();
  restartButton.visible = false;
  restartText.visible = false;

  const gameScene = game.scene.scenes[0];
  prepareGame(gameScene);
  gameScene.physics.resume();
}

function prepareGame(scene) {
  gameOver = false;
  score = 0;
  player = scene.physics.add.sprite(60, 265, 'bird');
  player.setCollideWorldBounds(true);
  player.body.gravity.y = 500;

  scene.physics.add.collider(player, ground, hitBird, null, scene);
  scene.physics.add.collider(player, pipesGroup, hitBird, null, scene);
}
