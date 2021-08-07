class Movable {
  constructor(bottom, left) {
    this.element = document.createElement("div");

    this.element.style.bottom = bottom + "%";
    this.element.style.left = left + "%"
  }

  set bottom(value) {
    this.element.style.bottom = value + "%";
  }

  set left(value) {
    this.element.style.left = value + "%";
  }

  get bottom() {
    return Number(
      this.element.style.bottom.substring(
        0,
        this.element.style.bottom.length - 1
      )
    );
  }

  get left() {
    return Number(
      this.element.style.left.substring(0, this.element.style.left.length - 1)
    );
  }
}

class Bird extends Movable {
  constructor(bottom, left) {
    super(bottom, left);
    this.element.classList.add("bird");
  }
}

class Obstacle extends Movable {
  constructor(bottom, left) {
    super(bottom, left);
    this.element.classList.add("obstacle");
  }
}

class Ground extends Movable {
  constructor(left) {
    super(0, left);
    this.element.classList.add("ground");
  }
}

class App {
  constructor() {
    this.container = document.querySelector(".game-container");
    this.loopTimeId;
    this.bird = new Bird(58.3, 37.5);
    this.obstacles = [];
    this.grounds = [];
    this.score = 0;
    this.health = 3;
    this.isCollied = false;
    this.isHealthUpdated = false;
  }

  createInfoBoard = () => {
    const infoBoard = document.createElement("div");
    infoBoard.classList.add("info-board");
    infoBoard.innerHTML =
      "<span class='score-container'>Score</span>" +
      "<span class='score'>0</span>" +
      "<span class='health'>Health</span>" +
      "<div class='health-bar-bg'><span class='health-bar'></span></div>";
    this.container.appendChild(infoBoard);
  };

  updateScore = () => {
    this.score += 1;
    const scoreElement = document.querySelector(".score");
    scoreElement.textContent = this.score;
  };

  updateHealth = () => {
    if (this.isHealthUpdated || this.health == 0) return;

    this.health -= 1;

    const healthBar = document.querySelector(".health-bar");
    healthBar.style.width = this.health + "rem";
    if (this.health == 2) {
      healthBar.style.backgroundColor = "orange";
    } else {
      healthBar.style.backgroundColor = "#F00";
    }

    this.isHealthUpdated = true;
  };

  createObstacle = () => {
    const bottom = 16.6 - Math.random() * 33.3;
    const bottom_obstacle = new Obstacle(bottom, 100);
    const top_obstacle = new Obstacle(bottom + 75, 100);
    top_obstacle.element.style.transform = "rotate(180deg)";
    this.container.appendChild(bottom_obstacle.element);
    this.container.appendChild(top_obstacle.element);
    this.obstacles.push(bottom_obstacle);
    this.obstacles.push(top_obstacle);
  };

  createGround = (left) => {
    const ground = new Ground(left);
    this.container.appendChild(ground.element);
    this.grounds.push(ground);
  };

  control = (e) => {
    if (e.key == " " || e.type == "touchstart") {
      this.bird.bottom += 6.6;
    }
  };

  loop = () => {
    this.bird.bottom -= 0.33;

    // Move ground
    if (this.grounds[0].left <= -100) {
      let ground = this.grounds.shift();
      this.container.removeChild(ground.element);
      this.createGround(100);
      this.updateScore();
    }
    this.grounds.forEach((ground) => {
      ground.left -= 0.33;
    });

    // Move obstacles
    if (this.obstacles[0].left < -12.5) {
      let obstacle = this.obstacles.shift();
      this.container.removeChild(obstacle.element);
      obstacle = this.obstacles.shift();
      this.container.removeChild(obstacle.element);
    }
    if (this.obstacles[0].left < 37.5 && this.obstacles.length == 2) {
      this.createObstacle();
    }
    this.obstacles.forEach((obstacle) => {
      obstacle.left -= 0.33;
    });

    // Check if the bird hit the ground
    if (this.bird.bottom < 16.6) {
      this.gameOver();
    }

    // Check if the bird hit the pipes
    this.obstacles.forEach((obstacle) => {
      this.checkCollision(this.bird, obstacle);
    });

    // See if we can set "isHealthUpdated" back to "false"
    if (this.isCollied) {
      this.isCollied = false;
      this.updateHealth();
    } else {
      this.isHealthUpdated = false;
    }

    if (this.health == 0) this.gameOver();
  };

  checkCollision = (bird, obstacle) => {
    if (
      bird.left + 12.5 > obstacle.left &&
      bird.left < obstacle.left + 15 &&
      bird.bottom + 8.3 > obstacle.bottom &&
      bird.bottom < obstacle.bottom + 50
    ) {
      this.isCollied = true;
    }
  };

  gameOver = () => {
    clearInterval(this.loopTimeId);
    this.createStartPage("Restart");
  };

  run = () => {
    this.container.appendChild(this.bird.element);
    this.createObstacle();
    this.createGround(0);
    this.createGround(100);
    this.createInfoBoard();
    this.createStartPage("Play");
  };

  startLoop = () => {
    this.loopTimeId = setInterval(this.loop, 20);
    document.addEventListener("keydown", this.control);
    document.addEventListener("touchstart", this.control)
  };

  refreshObstacles = () => {
    this.obstacles.forEach((obstacle) => {
      this.container.removeChild(obstacle.element);
    });
    this.obstacles = [];
    this.createObstacle();
  };

  createStartPage = (btnText) => {
    const startPage = document.createElement("div");
    startPage.classList.add("start");
    this.container.appendChild(startPage);
    startPage.innerHTML = `<p>Press SPACE or tap the screen to jump.</p>
      <button class='btn'>${btnText}</button>`;

    startPage.querySelector(".btn").addEventListener("click", () => {
      if (btnText == "Restart") {
        this.refreshObstacles();

        // Reset the bird's position
        this.bird.bottom = 58.3;
        this.bird.left = 37.5;

        // Reset infoboard
        this.score = 0;
        this.container.querySelector(".score").textContent = 0;
        this.health = 3;
        const healthBar = this.container.querySelector(".health-bar");
        healthBar.style.width = "3rem";
        healthBar.style.backgroundColor = "rgb(0, 238, 20)";
      }
      this.startLoop();
      this.container.removeChild(startPage);
    });
  };
}

const app = new App();
app.run();
