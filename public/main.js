const config = {
  width: 400,
  height: 512,
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
  bird: {
    normal: 'bird',
    kennzyM: 'bird-kennzyM',
    batestOk: 'bird-batestOk',
  },
  obstacle: {
    pipe: 'pipe',
    batestOk: 'pipe-batestOk',
    kennzyUe: 'pipe-kennzyUe',
  },
  scene: {
    width: 200,
    background: {
      day: 'background-day',
      night: 'background-night',
    },
    ground: 'ground',
    gameOver: 'game-over',
    restart: 'restart-button',
    messageInitial: 'message-initial',
  },
  scoreboard: {
    width: 25,
    base: 'number',
    number0: 'number0',
    number1: 'number1',
    number2: 'number2',
    number3: 'number3',
    number4: 'number4',
    number5: 'number5',
    number6: 'number6',
    number7: 'number7',
    number8: 'number8',
    number9: 'number9',
  },
  animation: {
    bird: {
      red: {
        clapWings: 'red-clap-wings',
        stop: 'red-stop',
      },
      blue: {
        clapWings: 'blue-clap-wings',
        stop: 'blue-stop',
      },
      yellow: {
        clapWings: 'yellow-clap-wings',
        stop: 'yellow-stop',
      },
    },
    ground: {
      moving: 'moving-ground',
      stop: 'stop-ground',
    },
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image(assets.bird.normal, 'assets/bird-normal.png');
  this.load.image(assets.bird.kennzyM, 'assets/bird-kennzyM.png');
  this.load.image(assets.bird.batestOk, 'assets/bird-batestOk.png');

  this.load.image(assets.obstacle.pipe, 'assets/pipe.png');
  this.load.image(assets.obstacle.kennzyUe, 'assets/pipe-kennzyUe.png');
  this.load.image(assets.obstacle.batestOk, 'assets/pipe-batestOk.png');

  this.load.spritesheet(assets.scene.ground, 'assets/ground-sprite.png', {
    frameWidth: config.width,
    frameHeight: 110,
  });
  this.load.image(assets.scene.gameOver, 'assets/gameover.png');
  this.load.image(assets.scene.restart, 'assets/restart-button.png');

  // Numbers
  this.load.image(assets.scoreboard.number0, 'assets/number0.png');
  this.load.image(assets.scoreboard.number1, 'assets/number1.png');
  this.load.image(assets.scoreboard.number2, 'assets/number2.png');
  this.load.image(assets.scoreboard.number3, 'assets/number3.png');
  this.load.image(assets.scoreboard.number4, 'assets/number4.png');
  this.load.image(assets.scoreboard.number5, 'assets/number5.png');
  this.load.image(assets.scoreboard.number6, 'assets/number6.png');
  this.load.image(assets.scoreboard.number7, 'assets/number7.png');
  this.load.image(assets.scoreboard.number8, 'assets/number8.png');
  this.load.image(assets.scoreboard.number9, 'assets/number9.png');
}

let player;
let pipe;
let gameOver;
let pipesGroup;
let scene;
let restartMessage;
let score;
let scoreboardGroup;
let labelScore;
let gameOverBanner;

let currentPipe;

function addRowOfPipes() {
  if (gameOver) {
    return;
  }
  const hole = Math.floor(Math.random() * 5) + 1;

  updateScore();

  if (score % 5 === 0 && score <= 10) {
    if (score === 5) {
      currentPipe = assets.obstacle.batestOk;
    } else if (score === 10) {
      currentPipe = assets.obstacle.kennzyUe;
    }
  }

  if (score % 10 === 0) {
    this.timer.delay = this.timer.delay - 100;
  }

  for (let i = 0; i < 7; i++) {
    if (i != hole && i != hole + 1) {
      const pipe = pipesGroup.create(450, i * 60 + 10, currentPipe);
      pipe.body.allowGravity = false;
    }
  }
}

function create() {
  pipesGroup = this.physics.add.group();
  scoreboardGroup = this.physics.add.staticGroup();

  const spaceKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );

  currentPipe = assets.obstacle.pipe;

  ground = this.physics.add.sprite(
    assets.scene.width,
    458,
    assets.scene.ground
  );
  ground.setCollideWorldBounds(true);
  ground.setDepth(10);

  this.timer = this.time.scene.time.addEvent({
    delay: 1800, // ms
    callback: addRowOfPipes,
    callbackScope: this,
    loop: true,
  });

  spaceKey.on('down', jump);

  this.anims.create({
    key: assets.animation.ground.moving,
    frames: this.anims.generateFrameNumbers(assets.scene.ground, {
      start: 0,
      end: 2,
    }),
    frameRate: 15,
    repeat: -1,
  });
  this.anims.create({
    key: assets.animation.ground.stop,
    frames: [
      {
        key: assets.scene.ground,
        frame: 0,
      },
    ],
    frameRate: 20,
  });

  prepareGame(this);

  gameOverBanner = this.add.image(
    assets.scene.width,
    240,
    assets.scene.gameOver
  );
  gameOverBanner.setDepth(20);
  gameOverBanner.visible = false;

  restartButton = this.add
    .image(200, 300, assets.scene.restart)
    .setInteractive();
  restartButton.on('pointerdown', restart);
  restartButton.setDepth(20);
  restartButton.visible = false;
}

function updateScore() {
  score++;
  updateScoreboard();
}

function updateScoreboard() {
  scoreboardGroup.clear(true, true);

  const scoreAsString = score.toString();
  if (scoreAsString.length == 1)
    scoreboardGroup
      .create(assets.scene.width, 30, assets.scoreboard.base + score)
      .setDepth(10);
  else {
    let initialPosition =
      assets.scene.width -
      (score.toString().length * assets.scoreboard.width) / 2;

    for (let i = 0; i < scoreAsString.length; i++) {
      scoreboardGroup
        .create(initialPosition, 30, assets.scoreboard.base + scoreAsString[i])
        .setDepth(10);
      initialPosition += assets.scoreboard.width;
    }
  }
}

function update() {
  if (gameOver) {
    return;
  }

  if (player.y < 0 || player.y > config.height) {
    restart();
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

function hitBird() {
  this.physics.pause();

  gameOver = true;

  gameOverBanner.visible = true;
  restartButton.visible = true;
}

function jump() {
  if (gameOver) {
    restart();

    return;
  }

  player.setVelocityY(-300);
  player.angle = -15;
}

function restart() {
  pipesGroup.clear(true, true);
  pipesGroup.clear(true, true);
  scoreboardGroup.clear(true, true);
  player.destroy();
  gameOverBanner.visible = false;
  restartButton.visible = false;

  const gameScene = game.scene.scenes[0];
  prepareGame(gameScene);
  gameScene.physics.resume();
}

function prepareGame(scene) {
  gameOver = false;
  score = 0;
  player = scene.physics.add.sprite(60, 200, assets.bird.kennzyM);
  player.setCollideWorldBounds(true);
  player.body.gravity.y = 500;
  currentPipe = assets.obstacle.pipe;

  const score0 = scoreboardGroup.create(
    assets.scene.width,
    30,
    assets.scoreboard.number0
  );
  score0.setDepth(20);

  scene.physics.add.collider(player, ground, hitBird, null, scene);
  scene.physics.add.collider(player, pipesGroup, hitBird, null, scene);
}
