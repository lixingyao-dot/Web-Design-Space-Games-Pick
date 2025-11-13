// 游戏变量
let canvas, ctx;
let gameActive = false;
let score = 0;
let moves = 0;
let time = 0;
let timer;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
const totalPairs = 12;
let stars = [];

const emojis = [
    "🌌", "🚀", "🌠", "🛸", "👽", "🌙",
    "☀️", "🪐", "⭐", "☄️", "🔭", "🛰️"
].slice(0, totalPairs);

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    createStars();
    
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    
    draw();
}

// 创建星星背景
function createStars() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 2 + 0.5
        });
    }
}

// 开始游戏
function startGame() {
    gameActive = true;
    score = 0;
    moves = 0;
    time = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    
    document.getElementById('score').textContent = score;
    document.getElementById('moves').textContent = moves;
    document.getElementById('time').textContent = time;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    if (timer) {
        clearInterval(timer);
    }
    
    timer = setInterval(() => {
        time++;
        document.getElementById('time').textContent = time;
    }, 1000);
    
    createCards();
    gameLoop();
}

// 创建卡片
function createCards() {
    const memoryBoard = document.getElementById('memoryBoard');
    memoryBoard.innerHTML = '';
    
    let cards = [];
    for (let i = 0; i < totalPairs; i++) {
        cards.push(emojis[i]);
        cards.push(emojis[i]);
    }
    
    cards = shuffleArray(cards);
    
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">
                <span class="card-icon">${emoji}</span>
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        memoryBoard.appendChild(card);
    });
}

// 随机
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 翻转卡片
function flipCard() {
    if (!gameActive) return;
    if (lockBoard) return;
    if (this === firstCard) return;
    
    this.classList.add('flipped');
    
    if (!firstCard) {
        firstCard = this;
        return;
    }
    
    secondCard = this;
    moves++;
    document.getElementById('moves').textContent = moves;
    lockBoard = true;
    
    checkForMatch();
}

// 检查卡片是否匹配
function checkForMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    
    if (isMatch) {
        disableCards();
        matchedPairs++;
        score += 50 + Math.max(0, 100 - time - moves);
        document.getElementById('score').textContent = score;
        
        if (matchedPairs === totalPairs) {
            gameComplete();
        }
    } else {
        unflipCards();
    }
}

// 禁用已匹配的卡片
function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    resetBoard();
}

// 翻回不匹配的卡片
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// 重置棋盘状态
function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// 游戏完成
function gameComplete() {
    gameActive = false;
    clearInterval(timer);
    
    const finalScore = score + Math.max(0, 500 - time * 2 - moves * 5);
    
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalTime').textContent = time;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    
    celebrate();
}

// 庆祝效果
function celebrate() {
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => {
        card.classList.add('pulse');
    });
}

// 游戏主循环
function gameLoop() {
    if (!gameActive) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function update() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// 绘制游戏
function draw() {
    ctx.fillStyle = 'rgba(10, 10, 30, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function backToMenu() {
    window.history.back();
}

const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', backToMenu);

// 页面加载完成后初始化游戏
window.addEventListener('load', init);