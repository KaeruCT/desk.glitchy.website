import { htmlToElement, makeWindow } from "./lib";
import "./sandtoy.css";
import sandToyImg from "./img/sandtoy.png";

export function openSandtoy() {
  return function () {
    const el = htmlToElement(
      `<div tabindex="0" class="sandtoy-container"></div>`
    );
    const win = makeWindow({
      icon: sandToyImg,
      title: "Sand Toy",
      content: el,
      width: 480,
      height: 390,
      className: "no-padding",
    });
    win.onClose = function () {
      game.stop();
    };
    const game = createGame(el);
    game.start();
  };
}

const types = {
  Void: {
    weight: 0,
    speed: 0,
    color: "transparent",
    spread: 0,
    strength: -9999,
    noGen: true,
  },
  Rock: {
    weight: 9999,
    speed: Infinity,
    color: "#47546d",
    spread: 0,
    strength: 10,
    noGen: true,
  },
  Lava: {
    weight: 30,
    speed: 3,
    color: "#f25e09",
    spread: 1,
    destroyer: true,
    strength: 5,
  },
  Dirt: {
    weight: 50,
    speed: 1,
    color: "#564629",
    spread: 0,
    strength: 1,
  },
  Sand: {
    weight: 20,
    speed: 1,
    color: "#9e895d",
    spread: 0,
    strength: 1,
  },
  Slime: {
    weight: 15,
    speed: 2,
    color: "#91dd39",
    spread: 2,
    strength: 1,
  },
  Water: {
    weight: 10,
    speed: 1,
    color: "#0f3a9e",
    spread: 5,
    strength: 0,
  },
  Air: {
    weight: -5,
    speed: 1,
    color: "#aaa",
    spread: 2,
    strength: 1,
  },
};

const names = Object.keys(types);
const els = names.map((n) => types[n]);
const nonGenTypes = els.filter((n) => n.noGen).map((_, i) => i);

function createGame(app) {
  let gens = [];
  function findGen(x, y) {
    return gens.find((g) => g.x === x && g.y === y);
  }

  function renderMap(ctx, map) {
    ctx.clearRect(0, 0, w * blockSize, h * blockSize);

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        ctx.fillStyle = els[map[y][x]].color;
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }

    gens.forEach((gen) => {
      const gsize = 2;
      const rectArgs = [
        gen.x * blockSize - gsize,
        gen.y * blockSize - gsize,
        blockSize + gsize * 2,
        blockSize + gsize * 2,
      ];
      ctx.fillStyle = els[gen.type].color;
      ctx.fillRect(...rectArgs);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.strokeRect(...rectArgs);
    });
  }

  function makeMap(w, h) {
    const map = [];
    for (let i = 0; i < h; i++) {
      const row = [];
      for (let j = 0; j < w; j++) {
        row.push(0);
      }
      map.push(row);
    }
    return map;
  }

  app.focus();
  const info = document.createElement("div");
  info.className = "info";
  app.appendChild(info);
  const canvas = document.createElement("canvas");
  app.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const blockSize = 4;
  const w = 120;
  const h = 80;
  const gameMap = makeMap(w, h);
  let dirtyMap = makeMap(w, h);
  canvas.width = blockSize * w;
  canvas.height = blockSize * h;

  function swap(x1, y1, x2, y2) {
    if (dirtyMap[y1][x1]) return true;
    let swapped = true;
    const current = gameMap[y1][x1];
    const other = gameMap[y2][x2];

    const currentType = els[current];
    const otherType = els[other];

    if (currentType.destroyer && otherType.destroyer) {
      // do nothing for now
      swapped = false;
    } else if (
      currentType.destroyer &&
      currentType.strength > otherType.strength
    ) {
      gameMap[y1][x1] = 0;
      gameMap[y2][x2] = otherType.strength === 0 ? 1 : current; // hack to turn water into rock
    } else if (
      otherType.destroyer &&
      otherType.strength > currentType.strength
    ) {
      gameMap[y1][x1] = 0;
      gameMap[y2][x2] = currentType.strength === 0 ? 1 : other; // hack to turn water into rock
    } else {
      const sameType = current === other;
      const weightDiff = y1 < y2 === currentType.weight > otherType.weight;
      const isRock =
        currentType.speed === Infinity || otherType.speed === Infinity; // fixme: do not break rock
      let shouldSwap = (!isRock && !sameType && weightDiff) || x1 !== x2;

      // fixme: avoid climbing but also allow water to settle
      let dirtyHack =
        currentType.spread > 0 || otherType.spread > 0 || !dirtyMap[y2][x2];

      if (shouldSwap && dirtyHack) {
        gameMap[y1][x1] = other;
        gameMap[y2][x2] = current;
      } else {
        swapped = false;
      }
    }

    if (swapped) {
      // fixme: hack to avoid the lighter "climbing" when swapping lighter for heavier
      dirtyMap[y1][x1] = 1;
      dirtyMap[y2][x2] = 1;
    }
    return swapped;
  }

  function choiceSwap(amount, x1, y1, x2, y2, x3, y3) {
    for (let i = 0; i <= amount; i++) {
      const current = els[gameMap[y1][x1]];
      const choice1 = gameMap[y2] && gameMap[y2][x2];
      const choice2 = gameMap[y3] && gameMap[y3][x3];
      // if the choice has no weight, make it -9999 so weightless particles can always move sideways
      const canSwap1 =
        choice1 !== undefined &&
        current.weight > (els[choice1].weight || -9999);
      const canSwap2 =
        choice2 !== undefined &&
        current.weight > (els[choice2].weight || -9999);
      let swapType = -1;

      if (canSwap1) swapType = 0;
      if (canSwap2) swapType = 1;
      if (canSwap1 && canSwap2) swapType = Math.random() > 0.5 ? 0 : 1;

      const ox1 = x1;
      const oy1 = y1;
      if (swapType === 0) {
        if (!swap(x1, y1, x2, y2)) return false;
        x1 = x2;
        y1 = y2;
        x2 += x2 - ox1;
        y2 += y2 - oy1;
      }
      if (swapType === 1) {
        if (!swap(x1, y1, x3, y3)) return false;
        x1 = x3;
        y1 = y3;
        x3 += x3 - ox1;
        y3 += y3 - oy1;
      }
    }
    return true;
  }

  function fill(type, x1, y1, x2, y2) {
    if (x1 < 0) x1 = 0;
    if (y1 < 0) y1 = 0;
    if (x2 >= w) x2 = w - 1;
    if (y2 >= h) y2 = h - 1;
    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        if (gameMap[y][x] === 0 || type === 0) {
          // only fill void or erase if void
          gameMap[y][x] = type;
        }
        // remove gens if filling with void
        if (type === 0) {
          gens = gens.filter((gen) => gen.x !== x || gen.y !== y);
        }
      }
    }
  }

  function process(clock, x, y) {
    const current = els[gameMap[y][x]];

    if (dirtyMap[y][x]) return;
    if (current.weight === 0) return;
    if (clock % current.speed !== 0) return;

    const dir = current.weight > 0 ? 1 : -1;
    const y2 = y + dir;

    // avoid going off bounds
    if (gameMap[y2]) {
      // prefer simple vertical swap only for positive weights
      if (swap(x, y, x, y2) && dir > 0) return;
    }

    // side swap, allowed only if has spread
    if (current.spread > 0) {
      if (choiceSwap(current.spread, x, y, x - 1, y, x + 1, y)) return;
    }
    // diagonal swap
    // allowed for everyone so particles can "slide off"
    choiceSwap(current.spread, x, y, x - 1, y2, x + 1, y2);
  }

  function update() {
    if (mouseDown) {
      if (genToggleOn && !nonGenTypes.includes(selectedType)) {
        // place generator
        if (!findGen(mouseX, mouseY)) {
          gens.push({ x: mouseX, y: mouseY, type: selectedType });
          mouseDown = false; // require user to click again for more generators
        }
      }

      if (selectedType === 0 || selectedType === 1) {
        // special case: Rock or Void
        fill(selectedType, mouseX - 2, mouseY - 2, mouseX + 2, mouseY + 2);
      } else {
        // only fill void
        if (gameMap[mouseY][mouseX] === 0) {
          gameMap[mouseY][mouseX] = selectedType;
        }
      }
    }

    dirtyMap = makeMap(w, h);
    for (let y = gameMap.length - 2; y >= 0; y--) {
      for (let x = gameMap[y].length - 1; x >= 0; x--) {
        process(clock, x, y);
      }
    }
    gens.forEach((gen) => {
      const type = els[gen.type];
      if (clock % type.speed === 0) {
        gameMap[gen.y][gen.x] = gen.type;
      }
    });
    clock++;
  }

  function loop() {
    update();
    renderMap(ctx, gameMap);
    if (!stopped) {
      requestAnimationFrame(loop);
    }
  }

  let stopped = false;
  let clock = 0;
  let mouseX = 0;
  let mouseY = 0;
  let mouseDown = false;
  let selectedType;
  let genToggleOn = false;

  function genToggleChange() {
    genToggleOn = !genToggleOn;
    setType(selectedType); // re-render menu
  }

  function setType(i) {
    if (!els[i]) return;

    selectedType = i;
    info.innerHTML = "";
    const genToggle = htmlToElement(`
    <div class="indicator gen" style="border-color: ${
      genToggleOn ? "#fff" : "transparent"
    }">
      <span>G</span>
    </div>
  `);
    genToggle.addEventListener("click", genToggleChange);
    info.appendChild(genToggle);

    els.forEach((el, i) => {
      const indicator = htmlToElement(`
      <div class="indicator" style="background: ${el.color}; border-color: ${
        selectedType === i ? "#fff" : "transparent"
      }">
        <span>${i + 1}</span>
      </div>
    `);
      indicator.addEventListener("click", () => setType(i));
      info.appendChild(indicator);
    });
  }

  setType(1);

  function pointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    const mx = t.clientX - rect.left;
    const my = t.clientY - rect.top;
    const factorX = canvas.width / rect.width;
    const factorY = canvas.height / rect.height;
    mouseX = Math.max(0, Math.floor((mx * factorX) / blockSize));
    mouseY = Math.max(0, Math.floor((my * factorY) / blockSize));
  }
  canvas.addEventListener("mousemove", function (e) {
    pointerMove(e);
  });
  canvas.addEventListener("touchmove", function (e) {
    pointerMove(e);
  });
  canvas.addEventListener("touchstart", function (e) {
    pointerMove(e);
    mouseDown = true;
  });
  canvas.addEventListener("touchend", function (e) {
    mouseDown = false;
  });
  canvas.addEventListener("mousedown", function (e) {
    pointerMove(e);
    mouseDown = true;
  });
  canvas.addEventListener("mouseup", function (e) {
    mouseDown = false;
  });
  canvas.addEventListener("mouseexit", function (e) {
    mouseDown = false;
  });

  app.addEventListener("keydown", function (e) {
    const code = e.keyCode || e.which;
    if (code === 32 || code === 71) {
      // space or G
      genToggleChange();
    } else {
      const i = code - 49;
      setType(i);
    }
  });

  function start() {
    loop();
  }

  function stop() {
    stopped = true;
  }

  return { start, stop };
}
