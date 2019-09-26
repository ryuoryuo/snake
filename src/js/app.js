const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let currentDirection = 'R';
let turnTimeout = false;
let blockSize = 20;
let gameStopped = false;
let appleCoords = [];
let appleHeight = 20;
let appleWidth = 20;
let tail = 5;
let gameInterval;

const directionActions = {
  T: point => {
    if (point.y - blockSize < 0) {
      return { x: point.x, y: canvas.height - blockSize };
    }
    return { x: point.x, y: point.y - blockSize };
  },
  D: point => {
    if (point.y + blockSize >= canvas.height) {
      return { x: point.x, y: 0 };
    }
    return { x: point.x, y: point.y + blockSize };
  },
  R: point => {
    if (point.x + blockSize >= canvas.width) return { x: 0, y: point.y };
    return { x: point.x + blockSize, y: point.y };
  },
  L: point => {
    if (point.x - blockSize < 0)
      return { x: canvas.width - blockSize, y: point.y };
    return { x: point.x - blockSize, y: point.y };
  }
};

userPosition = { x: 100, y: 0 };

const trail = [];

const updateAppleCoords = () => {
  const randomX = randomIntFromInterval(0, 29) * 20;
  const randomY = randomIntFromInterval(0, 29) * 20;
  appleCoords = [randomX, randomY];
};

const setGameInterval = () => {
  gameInterval = setInterval(() => {
    generateNewPosition();
    updateSnakePosition();
    spawnApple();
    turnTimeout = false;
  }, 1000 / 15);
};

updateAppleCoords();
setGameInterval();

const spawnApple = () => {
  ctx.fillStyle = 'red';
  ctx.fillRect(appleCoords[0], appleCoords[1], appleWidth, appleHeight);
};

const resetCanvas = () => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const updateSnakePosition = () => {
  resetCanvas();
  trail.forEach(point => {
    if (point.x === userPosition.x && point.y === userPosition.y) {
      tail = 5;
    }
    ctx.fillStyle = 'blue';
    ctx.fillRect(point.x, point.y, 20, 20);
  });
};

const generateNewPosition = () => {
  trail.push(userPosition);
  userPosition = directionActions[currentDirection](userPosition);
  if (userPosition.x === appleCoords[0] && userPosition.y === appleCoords[1]) {
    tail++;
    updateAppleCoords();
  }
  while (trail.length > tail) {
    trail.shift();
  }
};

document.onkeydown = function keyPress(e) {
  if (e.key === 'Escape') {
    if (!gameStopped) {
      clearInterval(gameInterval);
      gameStopped = true;
    } else {
      gameStopped = false;
      setGameInterval();
    }
  }

  if (turnTimeout) return;
  if (e.keyCode == '38') {
    if (currentDirection !== 'D') currentDirection = 'T';
    turnTimeout = true;
  } else if (e.keyCode == '40') {
    if (currentDirection !== 'T') currentDirection = 'D';
    turnTimeout = true;
  } else if (e.keyCode == '37') {
    if (currentDirection !== 'R') currentDirection = 'L';
    turnTimeout = true;
  } else if (e.keyCode == '39') {
    if (currentDirection !== 'L') currentDirection = 'R';
    turnTimeout = true;
  }
};

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
