const MIN_ENEMY = 1;
const MAX_ENEMY = 2;
const HEIGHT_ELEM = 100; //параметр не менять, т.к. придется менять css, чтобы машины влезли
const COUNT_CHANGE_LEVEL = 2000; //полсе этого числа увеличивается скорость игры

const score = document.querySelector('.score'),
    start = document.querySelector('.game__start'),
    gameArea = document.querySelector('.game__area'),
    car = document.createElement('div'),
    topScore = document.querySelector('.score-top');

const audio = document.createElement('embed');
audio.src = '../music/audio.mp3';
audio.type = 'audio/mp3';
audio.style.cssText = 'position: absolute; top: -10000px';  //так можно добавить аудио фоном     

car.classList.add('car');

gameArea.style.height = Math.floor(document.documentElement.clientHeight / HEIGHT_ELEM) * HEIGHT_ELEM; // для одинаковых линий и чтобы машины не накладывались

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowRight: false,
  ArrowLeft: false
};

const setting = {
  start: false,
  score: 0,
  speed: 0,
  traffic: 0,
  level: 0
};

//замыкаем значение level
let level = setting.level;

//обращаемся к локал сторедж
const maxScore = parseInt(localStorage.getItem('nfjs_score', setting.score));

topScore.textContent = maxScore ? maxScore : 0; //проверяем при запуске получение данных из локал сторедж

const addLocalStorage = () => {
  if (maxScore < setting.score) {
    localStorage.setItem('nfjs_score', setting.score);
    topScore.textContent = setting.score;
  }
}

//определяет количество линий, чтобы было заполнено поле
function getQuantityElements(heightElement) {
  return (gameArea.offsetHeight / heightElement) + 1;
};

//вычисляет случайное число в интервале, для изменения изображения соперников
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

//игра
function startGame(event) {
  //проверка нажатия кнопок
  const target = event.target;

  if (target === start) return;
  switch (target.id) {
    case 'easy':
      setting.speed = 3;
      setting.traffic = 5;
      break;
    case 'medium':
      setting.speed = 4;
      setting.traffic = 3;
      break;
    case 'hard':
      setting.speed = 7;
      setting.traffic = 2;
      break;
  }

  start.classList.add('hide');
  gameArea.innerHTML = '';
  //отрисовка игрока
  for (let i = 0; i < getQuantityElements(HEIGHT_ELEM); i++) {
    const line = document.createElement('div');
    line.classList.add('line');
    line.style.top = (i * HEIGHT_ELEM) + 'px';
    line.style.height = HEIGHT_ELEM / 2 + 'px';
    line.y = i * HEIGHT_ELEM;
    gameArea.appendChild(line);
  };

  //отрисовка соперника
  for (let j = 0; j < getQuantityElements(100 * setting.traffic); j++) {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.y = -HEIGHT_ELEM * setting.traffic * (j + 1);
    enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - HEIGHT_ELEM / 2)) + 'px';
    enemy.style.top = enemy.y + 'px';
    enemy.style.background = 'transparent url(../image/enemy' + getRandomIntInclusive(MIN_ENEMY, MAX_ENEMY) + '.png) center / cover  no-repeat';
    gameArea.append(enemy);
  }
  setting.score = 0;
  setting.start = true;
  gameArea.append(car);
  document.body.append(audio);
  car.style.left = gameArea.offsetWidth / 2 - car.offsetWidth / 2;
  car.style.bottom = '10px';
  car.style.top = 'auto';
  setting.x = car.offsetLeft;
  setting.y = car.offsetTop;
  requestAnimationFrame(playGame);
};

//функция логики движения нашей машины
function playGame() {

  //увеличение скорости при прохождении определенного кол-ва очков
  setting.level = Math.floor(setting.score / COUNT_CHANGE_LEVEL);

  if (setting.level !== level) {
    level = setting.level;
    setting.speed += 1;
  }

  if (setting.start) {
    setting.score += setting.speed;
    score.innerHTML = 'SCORE<br>' + setting.score;
    moveRoad();
    moveEnemy();
    if (keys.ArrowLeft && setting.x > 0) {
      setting.x -= setting.speed;
    };
    if (keys.ArrowRight && setting.x < (gameArea.offsetWidth - car.offsetWidth)) {
      setting.x += setting.speed;
    };
    if (keys.ArrowDown && setting.y < (gameArea.offsetHeight - car.offsetHeight)) {
      setting.y += setting.speed
    };
    if (keys.ArrowUp && setting.y > 0) {
      setting.y -= setting.speed;
    };
    car.style.left = setting.x + 'px';
    car.style.top = setting.y + 'px'
    requestAnimationFrame(playGame);
  };
};

//начало движения машины
function startRun(event) {
  if (keys.hasOwnProperty(event.key)) { //ownProperty проверяет свойства объекта
    event.preventDefault();
    keys[event.key] = true;
  }
};

//остановка движения машины
function stopRun() {
  if (keys.hasOwnProperty(event.key)) {
    event.preventDefault();
    keys[event.key] = false;
  }
};

//эффект движения дороги с помощью линий по середине
function moveRoad() {
  let lines = document.querySelectorAll('.line');
  lines.forEach(function (line) {
    line.y += setting.speed;
    line.style.top = line.y + 'px';

    if (line.y >= gameArea.offsetHeight) {
      line.y = -HEIGHT_ELEM;
    };
  });
}

//функция движения и появления соперника
function moveEnemy() {
  let enemys = document.querySelectorAll('.enemy');

  enemys.forEach(function (enemy) {
    //получает парраметры автомобиля
    let carRect = car.getBoundingClientRect();
    let enemyRect = enemy.getBoundingClientRect();

    //условия столкновения
    if (carRect.top <= enemyRect.bottom && carRect.right >= enemyRect.left &&
      carRect.left <= enemyRect.right && carRect.bottom >= enemyRect.top) {
      setting.start = false;
      audio.remove();
      console.warn('ДТП');
      start.classList.remove('hide');
      start.style.top = score.offsetHeight;
      addLocalStorage();
    }
    enemy.y += setting.speed / 2; //эффект движения относительно линиий дороги
    enemy.style.top = enemy.y + 'px';

    if (enemy.y >= gameArea.offsetHeight) {
      enemy.y = -HEIGHT_ELEM * setting.traffic;
      enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - HEIGHT_ELEM / 2)) + 'px';
    }
  })
};

start.addEventListener('click', startGame);
document.addEventListener('keydown', startRun);
document.addEventListener('keyup', stopRun);