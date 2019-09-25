const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
let currentDirection = 'R';

let snakeX = 0;
let snakeY = 0;
const snakeBlockWidth = 20;
let snakeHeight = 20;
let turnTimeout = false;
let snakeSpeed = 20;
let gameStopped = false;
let appleCoords = [];
let appleHeight = 20;
let appleWidth = 20;
let gameInterval;
const directionActions = {
  T: point => {
    if (point.y - snakeSpeed < 0) {
      return { x: point.x, y: canvas.height - snakeSpeed, direction: 'T' };
    }
    return { x: point.x, y: point.y - snakeSpeed, direction: 'T' };
  },
  D: point => {
    if (point.y + snakeSpeed >= canvas.height) {
      return { x: point.x, y: 0, direction: 'D' };
    }
    return { x: point.x, y: point.y + snakeSpeed, direction: 'D' };
  },
  R: point => {
    if (point.x + snakeSpeed >= canvas.width)
      return { x: 0, y: point.y, direction: 'R' };
    return { x: point.x + snakeSpeed, y: point.y, direction: 'R' };
  },
  L: point => {
    if (point.x - snakeSpeed < 0)
      return { x: canvas.width - snakeSpeed, y: point.y, direction: 'L' };
    return { x: point.x - snakeSpeed, y: point.y, direction: 'L' };
  }
};

let directionCoords = [
  {
    blockPositions: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 40, y: 0 },
      { x: 60, y: 0 }
    ],
    direction: 'R'
  }
];

const updateAppleCoords = () => {
  const randomX = randomIntFromInterval(0, 29) * 20;
  const randomY = randomIntFromInterval(0, 29) * 20;
  appleCoords = [randomX, randomY];
};

const setGameInterval = () => {
  gameInterval = setInterval(() => {
    checkAppleEat();
    generateNewPosition(currentDirection);
    updateSnakePosition();
    turnTimeout = false;
  }, 1000 / 14);
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

const checkAppleEat = () => {
  const headPointIndex = directionCoords[0].blockPositions.length - 1;
  const headPoint = directionCoords[0].blockPositions[headPointIndex];
  if (headPoint.x === appleCoords[0] && headPoint.y === appleCoords[1]) {
    updateAppleCoords();
    addNewPoint();
  }
};

const updateSnakePosition = () => {
  resetCanvas();
  spawnApple();
  directionCoords.forEach(directionData => {
    directionData.blockPositions.forEach(block => {
      ctx.fillStyle = 'blue';
      ctx.fillRect(block.x, block.y, 20, snakeHeight);
    });
  });
};
const generateNewPosition = direction => {
  const headPointIndex = directionCoords[0].blockPositions.length - 1;
  const headPoint = directionCoords[0].blockPositions[headPointIndex];
  if (directionCoords[0].direction !== direction) {
    directionCoords.unshift({
      blockPositions: [headPoint],
      requiredCoord: {
        x: headPoint.x,
        y: headPoint.y
      },
      direction
    });
    directionCoords[1].blockPositions.splice(headPointIndex, 1);
  }

  directionCoords.forEach((pointBlock, blockIndex) => {
    const lastBlockIndex = directionCoords.length - 1;

    pointBlock.blockPositions.forEach((point, pointIndex) => {
      if (blockIndex !== 0) {
        const nextDirectionCoords = directionCoords[blockIndex - 1];
        const currentDirectionCoords = directionCoords[blockIndex];
        const {
          x: requiredX,
          y: requiredY
        } = nextDirectionCoords.requiredCoord;
        if (point.x === requiredX && point.y === requiredY) {
          const newPoint = directionActions[nextDirectionCoords.direction](
            point
          );
          directionCoords[blockIndex - 1].blockPositions.unshift(newPoint);
          directionCoords[blockIndex].blockPositions.splice(pointIndex, 1);

          if (
            blockIndex === lastBlockIndex &&
            directionCoords[blockIndex].blockPositions.length === 0
          ) {
            directionCoords.splice(blockIndex, 1);
          }
        } else {
          const newPoint = directionActions[currentDirectionCoords.direction](
            point
          );
          directionCoords[blockIndex].blockPositions[pointIndex] = newPoint;
        }
      } else {
        const currentDirectionCoords = directionCoords[0];
        const newPoint = directionActions[currentDirectionCoords.direction](
          point
        );
        directionCoords[blockIndex].blockPositions[pointIndex] = newPoint;
        if (pointIndex === headPointIndex) {
          const context = canvas.getContext('2d');
          const [R, G, B] = context.getImageData(
            newPoint.x,
            newPoint.y,
            1,
            1
          ).data;

          if (R === 0 && G === 0 && B === 255) {
            alert('you lost');
          }
        }
      }
    });
  });
};

const addNewPoint = () => {
  const lastBlockIndex = directionCoords.length - 1;
  const lastBlock = directionCoords[lastBlockIndex];
  const lastBlockDirection = lastBlock.direction;
  const lastBlockLastPoint = lastBlock.blockPositions[0];

  const { x: lastPointCurrentX, y: lastPointCurrentY } = lastBlockLastPoint;
  const { x: lastPointNextX, y: lastPointNextY } = directionActions[
    lastBlockDirection
  ](lastBlockLastPoint);

  const newPoint = {
    x: lastPointCurrentX + (lastPointCurrentX - lastPointNextX),
    y: lastPointCurrentY + (lastPointCurrentY - lastPointNextY)
  };

  directionCoords[lastBlockIndex].blockPositions.unshift(newPoint);
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
