const veganItems = ['🍎', '🌽', '🍆', '🥕'];
const nonVeganItems = ['🥩', '🍗', '🍖', '🥪'];
const animals = ['🐈', '🐶', '🐱'];
const obstacles = [...veganItems, ...nonVeganItems, ...animals];

const playerEl = document.getElementById('player');
const overlayEl = document.getElementById('overlay');
const gameEl = document.getElementById('gameContainer');
const startBtn = document.getElementById('startButton');
const retryBtn = document.getElementById('retryButton');
const distanceEl = document.getElementById('distanceDisplay');
const missEl = document.getElementById('missDisplay');
const bgMusic = document.getElementById('music');
const sfxFail = document.getElementById('soundNo');
const sfxEat = document.getElementById('soundEat');

const mobileControls = document.getElementById('mobileControls');
const btnJump = document.getElementById('btnJump');
const btnEat = document.getElementById('btnEat');

let mouthOpen = false;
let jumping = false;
let dead = false;
let distance = 0;
let misses = 0;
let speed = 1250; // ms per km

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
let mobileFloor = isMobile ? window.innerHeight * 0.35 : 0;
const desktopFloor = 0;

if (isMobile) {
  mobileControls.style.display = 'flex';
  playerEl.style.bottom = `${mobileFloor}px`;
  playerEl.style.left = '20%';
  const hintsEl = document.getElementById("hints");
  hintsEl.style.top = '200%';
}

startBtn.onclick = () => {
  startBtn.style.display = 'none';
  overlayEl.style.opacity = 0;

  overlayEl.addEventListener('transitionend', () => {
    overlayEl.style.display = 'none';
    bgMusic.play();
    startGame();
  }, { once: true });
};

function startGame() {
  setInterval(updateDistance, speed);
  spawnObstacle();
}

function updateDistance() {
  if (dead) return;
  distance++;
  distanceEl.innerText = `${distance} km`;
  if (distance % 10 === 0) speed *= 0.98;
  if (distance >= 100) onWin();
}

function spawnObstacle() {
  if (dead) return;
  const emoji = obstacles[Math.floor(Math.random() * obstacles.length)];
  const obsEl = document.createElement('div');
  obsEl.className = 'obstacle';
  obsEl.innerText = emoji;
  obsEl.style.left = '100vw';
  obsEl.style.bottom = isMobile ? `${mobileFloor}px` : `${desktopFloor}px`;
  obsEl.style.animationDuration = speed + 'ms';
  gameEl.appendChild(obsEl);

  const collisionCheck = setInterval(() => {
    if (dead) {
      obsEl.remove();
      clearInterval(collisionCheck);
      return;
    }

    const obsRect = obsEl.getBoundingClientRect();
    const playerRect = playerEl.getBoundingClientRect();

    if (
      obsRect.left < playerRect.right &&
      obsRect.right > playerRect.left &&
      obsRect.bottom > playerRect.top
    ) {
      if (veganItems.includes(emoji)) {
        if (mouthOpen) {
          obsEl.remove();
        } else {
          sfxFail.play();
          misses++;
          missEl.innerText = `Miss: ${misses}`;
          obsEl.remove();
        }
      } else if (nonVeganItems.includes(emoji)) {
        if (mouthOpen) {
          triggerGameOver('resources/EAT-YOUR-VEGETABLES.gif', sfxEat);
        }
      } else if (animals.includes(emoji)) {
        if (!jumping) {
          triggerGameOver('resources/veganteacherNO.jpg', sfxFail, true);
        }
      }
    }
  }, 50);

  setTimeout(() => {
    obsEl.remove();
    if (!dead) spawnObstacle();
  }, speed + 1000);
}

function triggerGameOver(bgImg, sound, loop = false) {
  dead = true;
  document.getElementById("hints").style.display = "none";

  const bg = document.createElement("img");
  bg.src = bgImg;
  bg.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    z-index: 5;
  `;
  document.body.appendChild(bg);

  sound.loop = loop;
  sound.play();
  retryBtn.style.zIndex = "1000";
  retryBtn.style.display = "block";
}

function onWin() {
  dead = true;
  alert(`You reached the end with ${misses} misses!`);
  retryBtn.style.display = 'block';
}

retryBtn.onclick = () => {
  window.location.reload();
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    mouthOpen = true;
    playerEl.src = 'resources/veganteacherOPEN.jpg';
  } else if (e.key === ' ') {
    jump();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    mouthOpen = false;
    playerEl.src = 'resources/veganteacher.jpg';
  }
});

btnEat.addEventListener('touchstart', () => {
  mouthOpen = true;
  playerEl.src = 'resources/veganteacherOPEN.jpg';
});
btnEat.addEventListener('touchend', () => {
  mouthOpen = false;
  playerEl.src = 'resources/veganteacher.jpg';
});

btnJump.addEventListener('click', () => {
  jump();
});

function jump() {
  if (!jumping) {
    jumping = true;
    playerEl.style.bottom = isMobile ? `${mobileFloor + 150}px` : '150px';
    setTimeout(() => {
      playerEl.style.bottom = isMobile ? `${mobileFloor}px` : '0px';
      jumping = false;
    }, 800);
  }
}