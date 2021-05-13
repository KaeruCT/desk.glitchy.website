import { htmlToElement, makeWindow } from "./lib";
import "./lettershooter.css";
import letterShooterImg from "./img/lettershooter.png";

export function openLetterShooter() {
  return function () {
    const win = makeWindow({
      icon: letterShooterImg,
      title: "Letter Shooter",
      content:
        htmlToElement(`<div class="lettershooter"><div class="deb" tabindex="0"></div>
            <div class="ins"><b>Instructions</b><br>Arrows/WASD: move<br>Space, X or C: shoot<br>Z: shields</div>
            </div>`),
      width: 320,
      height: 600,
      className: "no-padding",
    });

    var sizeX = 16;
    var sizeY = 28;
    var map = [];

    for (let i = 0; i < sizeY; i++) {
      map[i] = [];
      for (let e = 0; e < sizeX; e++) {
        if (i + 2 == sizeY && Math.random() > 0.6) map[i][e] = 4;
        else map[i][e] = 0;
      }
    }

    map[sizeY - 1][Math.round(sizeX / 2) - 1] = 1;

    var obs = [],
      outs = [
        "&nbsp;",
        '<span class="g">A</span>',
        '<span class="v">Y</span>',
        '<span class="s">^</span>',
        '<span class="sh">o</span>',
      ],
      gy = map.length - 1;
    var spaces = ["&nbsp;", ".", ":", "'", ","];
    var evils = ["Y", "V", "U", "W", "M"];
    var gx = map[gy].indexOf(1),
      score = 0,
      hit = 0,
      shields = 3,
      lives = 10,
      t = 150,
      freq = 600,
      freqmin = 50;
    var bullet = 0,
      bullets = 0,
      maxbullets = sizeX;

    function mapPrint() {
      var txt = "";
      outs[2] =
        '<span class="v">' +
        evils[Math.floor(evils.length * Math.random())] +
        "</span>";
      for (let i = 0; i < map.length; i++) {
        txt = txt + "|";
        var brd = "";
        for (let e = 0; e < map[i].length; e++) {
          outs[0] =
            '<span class="bg">' +
            spaces[Math.floor(spaces.length * Math.random())] +
            "</span>";
          txt = txt + outs[map[i][e]] + outs[0];
          brd = brd + "--";
        }
        txt = txt + "|<br>";
      }
      let sc = score - hit;
      if (sc < 0) {
        sc = 0;
        score = 0;
        hit = 0;
      }
      win.body.querySelector(".deb").innerHTML =
        "&nbsp;" +
        brd +
        "<br>" +
        txt +
        brd +
        "<br>HP: " +
        lives +
        "<br>Score: " +
        sc +
        "<br>Shields: " +
        shields;
      if (lives) setTimeout(mapPrint, 50);
      else {
        win.body.querySelector(".deb").innerHTML =
          '<div style="font-size: 4em;"><b>THE GAME</b>,<br> YOU JUST LOST IT!<br>YOUR SCORE: ' +
          sc +
          "</div>";
        win.body.querySelector(".ins").style.display = "none";
        return false;
      }
      /*$('.s').text(bullet?'x':'+');
        bullet = !bullet;*/
    }
    function getKeyCode(event) {
      return event.which ? event.which : event.keyCode;
    }
    function obscreate(t) {
      if (t == 2) {
        const n = Math.round(map[0].length * Math.random());
        if (map[0][n] == 0) {
          map[0][n] = t;
          obs.push("0|" + n + "|" + t);
        }
        freq = freq > freqmin ? (freq -= 2) : freq;
        setTimeout(() => obscreate(2), freq);
      } else if (t == 3) {
        let px = gx;
        let py = gy - 1;

        if (py > 0) {
          map[py][px] = t;
          obs.push(py + "|" + px + "|" + t);
        }
      }
    }

    function killob(ypos, xpos) {
      for (let i = 0; i < obs.length; i++) {
        const ob = obs[i].split("|");
        let y = ob[0] * 1;
        let x = ob[1] * 1;

        if (ypos == y && xpos == x) {
          obs.splice(i, 1);
          return 1;
        }
      }
    }

    function obsmove() {
      for (let i = 0; i < obs.length; i++) {
        const ob = obs[i].split("|");
        let y = ob[0] * 1;
        let x = ob[1] * 1;
        let ty = ob[2] * 1;
        if (ty == 2) {
          let w = y + 1;
          if (w < map.length && w > 0) {
            if (map[w][x] == 0) {
              map[y][x] = 0;
              map[w][x] = ty;
              obs[i] = w + "|" + x + "|" + ty;
            } else if (map[w][x] == 1) {
              lives--;
              obs.splice(i, 1);
              map[y][x] = 0;
            } else if (map[w][x] == 3) {
              obs.splice(i, 1);
              map[w][x] = map[y][x] = 0;
              score += 100;
              killob(w, x);
              bullets--;
            } else if (map[w][x] == 4) {
              obs.splice(i, 1);
              map[w][x] = map[y][x] = 0;
              killob(w, x);
            } else {
              obs.splice(i, 1);
              map[y][x] = 0;
            }
          } else {
            obs.splice(i, 1);
            map[y][x] = 0;
            hit += 50;
          }
        } else if (ty == 3) {
          let w = y - 1;
          if (w < map.length && w > 0) {
            if (map[w][x] == 0) {
              map[y][x] = 0;
              map[w][x] = ty;
              obs[i] = w + "|" + x + "|" + ty;
            }
          } else {
            obs.splice(i, 1);
            map[y][x] = 0;
            bullets--;
          }
        }
      }
      setTimeout(obsmove, t);
      t = t > 75 ? (t -= 1) : t;
    }
    function act(keyCode) {
      if (
        (keyCode == 32 || keyCode == 67 || keyCode == 88) &&
        bullets < maxbullets
      ) {
        obscreate(3);
        bullets++;
      } else if (
        keyCode == 90 &&
        shields &&
        gy - 1 < map.length &&
        gy - 1 > 0
      ) {
        for (let e = 0; e < sizeX; e++) {
          map[gy - 1][e] = 4;
        }
        shields--;
      } else {
        var nextX = gx,
          nextY = gy;
        switch (keyCode) {
          case 38: //Up
          case 87: //W
            nextY--;
            break;
          case 37: //Left
          case 65: //A
            nextX--;
            break;
          case 40: //Down
          case 83: //S
            nextY++;
            break;
          case 39: //Right
          case 68: //D
            nextX++;
            break;
        }

        if (
          nextY < map.length &&
          nextY >= 0 &&
          nextX < map[0].length &&
          nextX >= 0
        ) {
          if (map[nextY][nextX] == 0) {
            map[gy][gx] = 0;
            map[nextY][nextX] = 1;
            gx = nextX;
            gy = nextY;
          }
        }
      }
    }

    const field = win.body.querySelector(".deb");
    field.addEventListener("keydown", function (event) {
      act(getKeyCode(event));
    });
    field.focus();
    obscreate(2);
    obsmove();
    mapPrint();
  };
}
