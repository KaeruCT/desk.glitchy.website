import intersects from "intersects";
import ctk from "./ctk";
import { htmlToElement, makeWindow } from "./lib";
import "./asteroids.css";
import asteroidsImg from "./img/asteroids.png";

export function openAsteroids() {
  return function () {
    const el = htmlToElement(
      `<div tabindex="0" class="asteroids-container"></div>`
    );
    const win = makeWindow({
      icon: asteroidsImg,
      title: "Asteroids",
      content: el,
      width: 600,
      height: 450,
      className: "no-padding",
    });
    const game = startGame(el);
    win.onClose = function () {
      game.stop();
    };
    game.startGame();
  };
}

function startGame(parent) {
  const el = document.createElement("canvas");
  const info = document.createElement("div");
  const infoText = document.createElement("div");
  const helpText = document.createElement("div");
  const healthBar = document.createElement("div");

  info.className = "info";
  info.appendChild(infoText);
  info.appendChild(helpText);
  info.appendChild(healthBar);
  infoText.className = "info-text";
  helpText.className = "help-text";
  healthBar.className = "health-bar";
  helpText.innerText = "Move: arrow keys/WASD; Shoot: space; Teleport: shift";
  el.width = 600;
  el.height = 400;

  parent.appendChild(info);
  parent.appendChild(el);

  const graphics = new ctk.Graphics(el);

  const canvasWidth = graphics.getWidth();
  const canvasHeight = graphics.getHeight();
  let ship;
  let asteroids = [];
  const bullets = [];
  let stopped = false;
  let paused = false;
  let hurt = false;
  let tripleBullet = false;
  let minAsteroids = 5;
  let bulletsShot = 0;
  let score = 0;
  let clock = 0;
  let unlockClock;
  let shooting = false;
  let minShootingMod = 3;
  let shootingMod = minShootingMod;
  let maxShootingMod = 15;
  const fastShootingMod = 5;

  setTimeout(() => parent.focus(), 100);

  parent.addEventListener("focus", function () {
    paused = false;
  });

  parent.addEventListener("blur", function () {
    paused = true;
  });
  parent.addEventListener("keydown", function (e) {
    const code = e.which || e.keyCode;
    switch (code) {
      case 37:
      case 65:
        ship.changeDir(0, true);
        break;
      case 39:
      case 68:
        ship.changeDir(1, true);
        break;
      case 38:
      case 87:
        ship.changeDir(2, true);
        break;
      case 40:
      case 83:
        ship.changeDir(3, true);
        break;
      case 32:
        shooting = true;
        break;
    }
  });

  parent.addEventListener("keyup", function (e) {
    const code = e.which || e.keyCode;
    switch (code) {
      case 37:
      case 65:
        ship.changeDir(0, false);
        break;
      case 39:
      case 68:
        ship.changeDir(1, false);
        break;
      case 38:
      case 87:
        ship.changeDir(2, false);
        break;
      case 40:
      case 83:
        ship.changeDir(3, false);
        break;
      case 16:
        const randX = Math.ceil(16 + Math.random() * canvasWidth - 8.0);
        const randY = Math.ceil(16 + Math.random() * canvasHeight - 8.0);
        ship.teleport(randX, randY, canvasHeight, canvasWidth);
        break;
      case 27:
        paused = !paused;
        break;
      case 82:
        initialize();
        break;
      case 32:
        shooting = false;
        break;
    }
  });

  function initialize() {
    paused = false;
    asteroids = [];
    ship = Ship(
      canvasWidth / 2,
      canvasHeight / 2,
      14,
      100 + Math.random() * 400,
      "rgb(0, 255, 255)"
    );
    bulletsShot = 0;
    score = 0;
    maxShootingMod = 20;
    shootingMod = maxShootingMod;
    tripleBullet = false;
    unlockClock = 0;
    clock = 0;
    createAsteroids();
  }

  function createAsteroids() {
    for (let i = 0; i < minAsteroids; i++) {
      let xPos, yPos, ang;
      switch (i % 4) {
        case 3:
          xPos = 4;
          yPos = Math.ceil(Math.random() * (canvasHeight - 4));
          ang = 90;
          break;
        case 2:
          xPos = Math.ceil(Math.random() * (canvasWidth - 4));
          yPos = 4;
          ang = 180;
          break;
        case 1:
          xPos = canvasWidth - 4;
          yPos = Math.ceil(Math.random() * (canvasHeight - 4));
          ang = 270;
          break;
        case 0:
          xPos = Math.ceil(Math.random() * (canvasWidth - 4));
          yPos = canvasHeight - 4;
          ang = 0;
          break;
      }
      ang += -(20 + Math.random() * 20);
      const aSize = Math.ceil(2 + Math.random() * 2);
      const newAsteroid = Asteroid(xPos, yPos, aSize, ang);
      asteroids.push(newAsteroid);
    }
  }

  function update() {
    if (paused) {
      return;
    }
    const text = `Score: ${score}; Shots: ${bulletsShot}`;
    infoText.innerText = text;
    const h = ship.health / ship.maxHealth;
    healthBar.style.width = `${h * 100}%`;
    healthBar.style.background = `rgb(${255 - h * 255}, ${h * 255}, ${0})`;
    hurt = false;
    if (score >= 60 && maxShootingMod !== fastShootingMod) {
      maxShootingMod = fastShootingMod;
      unlockClock = clock;
    }
    if (score >= 250 && !tripleBullet) {
      tripleBullet = true;
      unlockClock = clock;
    }
    if (asteroids.length < minAsteroids / 2) {
      minAsteroids += 2;
      createAsteroids();
    }
    if (!ship.isDead && !ship.teleporting) {
      if (ship.x < 0) {
        ship.setPos(canvasWidth, ship.y);
      } else if (ship.x > canvasWidth) {
        ship.setPos(0, ship.y);
      }
      if (ship.y < 0) {
        ship.setPos(ship.x, canvasHeight);
      } else if (ship.y > canvasHeight) {
        ship.setPos(ship.x, 0);
      }
      if (ship.left) {
        ship.rotate(-5);
        ship.deAc(0.5);
      }
      if (ship.right) {
        ship.rotate(5);
        ship.deAc(0.5);
      }
      if (ship.up) {
        ship.acc(1);
      } else {
        ship.deAc(0.5);
      }
      if (ship.down) ship.deAc(2.5);
      ship.move();
    }

    const newAsts = [];
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      ast.move();
      if (ast.x <= 0) {
        ast.setPos(canvasWidth - 1, ast.y);
      } else if (ast.x > canvasWidth) {
        ast.setPos(1, ast.y);
      }
      if (ast.y <= 0) {
        ast.setPos(ast.x, canvasHeight - 1);
      } else if (ast.y > canvasHeight - 1) {
        ast.setPos(ast.x, 1);
      }
      const poly = ast.getPolygon();
      if (!ship.isDead && intersects.polygonBox(poly.all, ...ship.getRect())) {
        ship.decHealth(10);
        hurt = true;
      }
      for (let k = bullets.length - 1; k >= 0; k--) {
        const bull = bullets[k];
        if (intersects.polygonPoint(poly.all, bull.x, bull.y)) {
          asteroids.splice(i, 1);
          bullets.splice(k, 1);
          score += 10;
          if (ast.size > 1) {
            newAsts.push(Asteroid(ast.x, ast.y, ast.size - 1, ast.ang - 27.5));
            newAsts.push(Asteroid(ast.x, ast.y, ast.size - 1, ast.ang + 27.5));
          }
        }
        if (
          bull.x <= 0 ||
          bull.x > canvasWidth ||
          bull.y <= 0 ||
          bull.y > canvasHeight
        ) {
          bullets.splice(k, 1);
        }
      }
    }
    bullets.forEach((b) => b.move());
    ship.update();
    newAsts.forEach((a) => asteroids.push(a));
    clock++;
    if (clock % 100 === 0 && !ship.isDead) ship.incHealth(10);
    if (shooting) {
      if (clock % shootingMod === 0) shootBullet();
      if (shootingMod === 0) shootingMod = minShootingMod;
      if (clock % 10 === 0) {
        shootingMod += 1;
        if (shootingMod > maxShootingMod) shootingMod = minShootingMod;
      }
    } else {
      shootingMod = 0;
    }
  }

  function shootBullet() {
    if (!ship.isDead && !ship.teleporting) {
      const r = Math.floor(127 + Math.random() * 127);
      const g = Math.floor(127 + Math.random() * 127);
      const b = Math.floor(127 + Math.random() * 127);
      const color = `rgb(${r}, ${g}, ${b})`;
      ship.setColor(color);
      const newBullet = Bullet(ship.x, ship.y, ship.ang, color);
      bullets.push(newBullet);
      if (tripleBullet) {
        bullets.push(Bullet(ship.x, ship.y, ship.ang + 30, color));
        bullets.push(Bullet(ship.x, ship.y, ship.ang - 30, color));
        bulletsShot++;
        bulletsShot++;
      }
      bulletsShot++;
    }
  }

  function render() {
    let color;
    if (hurt) {
      color = "rgb(64, 0, 0)";
    } else {
      color = "#000";
    }
    graphics.setColor(color);
    graphics.fillRect(0, 0, canvasWidth, canvasHeight);
    ship.draw(graphics);
    bullets.forEach((b) => b.draw(graphics));
    asteroids.forEach((a) => a.draw(graphics));

    if (ship.isDead) {
      drawCenteredString(
        "GAME OVER - Press 'R' to restart",
        "rgb(255, 0, 255)"
      );
    } else if (paused) {
      drawCenteredString("PAUSED! CLICK TO UNPAUSE!", "#fff");
    } else if (tripleBullet && clock - 100 < unlockClock) {
      drawCenteredString("TRIPLE BULLET UNLOCKED!", "rgb(0, 255, 255)");
    } else if (
      maxShootingMod === fastShootingMod &&
      clock - 100 < unlockClock
    ) {
      drawCenteredString("FAST SHOOTING UNLOCKED!", "rgb(0, 255, 255)");
    }
  }

  function drawCenteredString(str, c) {
    graphics.getContext().font = "20px monospace";
    const stringWidth = graphics.getFontMetrics().stringWidth(str);
    graphics.setColor(c);
    graphics.drawString(str, (canvasWidth - stringWidth) / 2, canvasHeight / 2);
  }

  function startGame() {
    initialize();

    function doUpdate() {
      update();
      render();
      if (stopped) return;
      requestAnimationFrame(doUpdate);
    }
    doUpdate();
  }

  function stop() {
    stopped = true;
  }

  return { stop, startGame };
}

function Asteroid(x, y, size, ang) {
  let vel = 2;
  const nPoints = Math.ceil(8.0 + Math.random() * 8.0);
  let radius = 0;
  let life = 0;
  const pointsX = [];
  const pointsY = [];

  switch (size) {
    default:
      radius = 8;
      break;
    case 2:
      radius = 16;
      break;
    case 3:
      radius = 24;
      break;
    case 4:
      radius = 32;
      break;
  }

  for (let i = 0; i < nPoints; i++) {
    const a = (Math.PI * 2 * (nPoints / 2 - i)) / nPoints;
    const coordX =
      Math.floor(Math.sin(a) * radius) -
      (Math.random() * radius) / 2 +
      radius / 2;
    const coordY =
      Math.floor(Math.cos(a) * radius) -
      (Math.random() * radius) / 2 +
      radius / 2;
    pointsX[i] = coordX;
    pointsY[i] = coordY;
  }

  function getPolygon() {
    return makePolygon(x, y, pointsX, pointsY);
  }

  function draw(g) {
    g.setStrokeColor("#fff");
    const { x, y, points } = getPolygon();
    g.drawPolygon(x, y, points);
  }

  function setPos(nx, ny) {
    x = nx;
    y = ny;
  }

  function move() {
    const rad = 0.017453292519943295 * ang;
    x += vel * Math.cos(rad);
    y += vel * Math.sin(rad);
    life++;
    if (life % 10 === 0) ang += 0.2;
    if (life % 50 === 0) vel += 0.5;
  }

  return {
    draw,
    setPos,
    move,
    getPolygon,
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get ang() {
      return ang;
    },
    get size() {
      return size;
    },
  };
}

function Bullet(x, y, ang, color) {
  const vel = 7;

  function draw(g) {
    g.setColor(color);
    g.fillRect(x - 1, y - 1, 2, 2);
  }

  function move() {
    const rad = 0.017453292519943295 * (ang - 90);
    x += vel * Math.cos(rad);
    y += vel * Math.sin(rad);
  }

  function setPos(nx, ny) {
    x = nx;
    y = ny;
  }

  return {
    draw,
    move,
    setPos,
    get x() {
      return x;
    },
    get y() {
      return y;
    },
  };
}

function Ship(x, y, startHeight, mHealth, color) {
  const maxHealth = mHealth;
  let health = mHealth;
  const maxHeight = startHeight;
  let height = startHeight;

  const nPoints = 4;
  let ang = 0;
  let clock = 0;

  const maxVel = 6;

  let telX;

  let telY;
  const pointsX = [];
  const pointsY = [];
  let vel = 0.0;

  let movAng = 0.0;

  let isDead = false;
  let teleporting = false;
  let left = false;
  let right = false;
  let up = false;
  let down = false;

  function update() {
    height =
      health / maxHealth < 0.5
        ? ((maxHeight * health) / maxHealth) * 2.0
        : maxHeight;
    height = height < 4 ? 4 : height;
    const l = height / Math.sqrt(0.75);
    const rad = 0.017453292519943295 * ang;
    pointsX[0] = x;
    pointsX[1] = x + l / 2;
    pointsX[2] = x;
    pointsX[3] = x - l / 2;
    pointsY[0] = y - l / 2;
    pointsY[1] = y + l / 2;
    pointsY[2] = y + l / 4;
    pointsY[3] = y + l / 2;
    for (let i = 0; i < nPoints; i++) {
      const xOld = pointsX[i] - x;
      const yOld = pointsY[i] - y;
      pointsX[i] = x + xOld * Math.cos(rad) - yOld * Math.sin(rad);
      pointsY[i] = y + xOld * Math.sin(rad) + yOld * Math.cos(rad);
    }
    clock++;
    if (teleporting && clock % 50 === 0) {
      setPos(telX, telY);
      teleporting = false;
    }
  }

  function getRect() {
    const l = height / Math.sqrt(0.75);
    const l4 = l / 4;
    return [x - l4, y - l4, l4 * 2, l4 * 2];
  }

  function decHealth(amount) {
    if (health - amount >= 0) {
      health -= amount;
    } else {
      health = 0.0;
      isDead = true;
    }
  }

  function incHealth(amount) {
    if (health + amount > maxHealth) {
      health = maxHealth;
    } else {
      health += amount;
    }
  }

  function changeDir(dir, state) {
    switch (dir) {
      case 0:
        left = state;
        break;
      case 1:
        right = state;
        break;
      case 2:
        up = state;
        break;
      case 3:
        down = state;
        break;
    }
  }

  function teleport(x, y, vheight, vwidth) {
    teleporting = true;
    clock = 0;
    telX = x;
    telY = y;
    setPos(vheight + height * 2, vwidth + height * 2);
  }

  function setPos(nx, ny) {
    x = nx;
    y = ny;
  }

  function setColor(ncolor) {
    color = ncolor;
  }

  function rotate(deg) {
    ang += deg;
  }

  function acc(amount) {
    if (movAng != ang) movAng += (ang - movAng) / 30;
    if (clock % 10 === 0 && vel + amount <= maxVel) vel += amount;
  }

  function deAc(amount) {
    if (movAng != ang) movAng += (ang - movAng) / 20;
    if (clock % 30 === 0)
      if (vel - amount >= 0) {
        vel -= amount;
      } else {
        vel = 0;
      }
  }

  function move() {
    const rad = 0.017453292519943295 * (movAng - 90);
    x += vel * Math.cos(rad);
    y += vel * Math.sin(rad);
  }

  function getPolygon() {
    return makePolygon(0, 0, pointsX, pointsY);
  }

  function draw(g) {
    g.setStrokeColor(color);
    const { x, y, points } = getPolygon();
    g.drawPolygon(x, y, points);
  }

  return {
    move,
    draw,
    deAc,
    acc,
    rotate,
    setColor,
    setPos,
    teleport,
    changeDir,
    incHealth,
    decHealth,
    getRect,
    update,
    getPolygon,
    get health() {
      return health;
    },
    get maxHealth() {
      return maxHealth;
    },
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get ang() {
      return ang;
    },
    get teleporting() {
      return teleporting;
    },
    get isDead() {
      return isDead;
    },
    get left() {
      return left;
    },
    get right() {
      return right;
    },
    get up() {
      return up;
    },
    get down() {
      return down;
    },
  };
}

function makePolygon(x, y, pointsX, pointsY) {
  const xp = pointsX.map((p) => p + x);
  xp.push(xp[0]);
  const yp = pointsY.map((p) => p + y);
  yp.push(yp[0]);
  return {
    x: xp,
    y: yp,
    all: [].concat(...xp.map((p, i) => [p, yp[i]])),
    points: xp.length,
  };
}
