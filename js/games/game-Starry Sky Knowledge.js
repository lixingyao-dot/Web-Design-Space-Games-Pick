// 游戏变量
let canvas, ctx;
let gameActive = false;
let score = 0;
let time = 0;
let timer;
let currentQuestion = 0;
let correctAnswers = 0;
let questionAnswered = false;
let stars = [];

// 问题库
const questions = [
    {
        question: "地球围绕什么天体旋转？",
        answers: ["月球", "太阳", "金星", "火星"],
        correct: 1
    },
    {
        question: "太阳系中最大的行星是哪个？",
        answers: ["木星", "土星", "地球", "天王星"],
        correct: 0
    },
    {
        question: "我们所在的星系叫做什么？",
        answers: ["仙女座星系", "银河系", "大麦哲伦云", "三角座星系"],
        correct: 1
    },
    {
        question: "下列哪个是恒星？",
        answers: ["地球", "月球", "太阳", "火星"],
        correct: 2
    },
    {
        question: "冥王星被归类为什么类型的天体？",
        answers: ["行星", "矮行星", "小行星", "彗星"],
        correct: 1
    },
    {
        question: "哈雷彗星大约每隔多少年出现一次？",
        answers: ["76年", "100年", "50年", "25年"],
        correct: 0
    },
    {
        question: "月球是地球的什么？",
        answers: ["行星", "恒星", "卫星", "彗星"],
        correct: 2
    },
    {
        question: "光年是什么单位？",
        answers: ["时间单位", "距离单位", "质量单位", "速度单位"],
        correct: 1
    },
    {
        question: "下列哪个行星有明显的光环？",
        answers: ["水星", "金星", "土星", "火星"],
        correct: 2
    },
    {
        question: "北斗七星属于哪个星座？",
        answers: ["大熊座", "小熊座", "猎户座", "天鹰座"],
        correct: 0
    }
];

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    createStars();

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.getElementById('nextBtn').addEventListener('click', showNextQuestion);

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
            speed: Math.random() * 0.5 + 0.1
        });
    }
}

// 开始游戏
function startGame() {
    gameActive = true;
    score = 0;
    time = 0;
    currentQuestion = 0;
    correctAnswers = 0;
    questionAnswered = false;
    
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = time;
    document.getElementById('questionCount').textContent = `${currentQuestion + 1}/${questions.length}`;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('feedback').classList.remove('correct', 'incorrect');
    
    if (timer) {
        clearInterval(timer);
    }

    timer = setInterval(() => {
        if (gameActive) {
            time++;
            document.getElementById('time').textContent = time;
        }
    }, 1000);

    showQuestion(currentQuestion);

    gameLoop();
}

// 显示问题
function showQuestion(index) {
    const question = questions[index];
    const questionText = document.getElementById('questionText');
    const answersContainer = document.getElementById('answersContainer');
    const nextBtn = document.getElementById('nextBtn');

    questionAnswered = false;
    nextBtn.classList.remove('visible');
    document.getElementById('feedback').classList.remove('correct', 'incorrect');

    questionText.textContent = question.question;
    questionText.classList.add('float');

    answersContainer.innerHTML = '';
    question.answers.forEach((answer, i) => {
        const answerCard = document.createElement('div');
        answerCard.classList.add('answer-card');
        answerCard.textContent = answer;
        answerCard.dataset.index = i;
        
        answerCard.addEventListener('click', () => selectAnswer(answerCard, i, question.correct));
        
        answersContainer.appendChild(answerCard);
    });
}

// 选择答案
function selectAnswer(answerCard, selectedIndex, correctIndex) {
    if (questionAnswered || !gameActive) return;
    
    questionAnswered = true;
    const feedback = document.getElementById('feedback');
    const answerCards = document.querySelectorAll('.answer-card');

    answerCards.forEach((card, i) => {
        if (i === correctIndex) {
            card.classList.add('correct');
        } else if (i === selectedIndex) {
            card.classList.add('incorrect');
        }
        card.style.pointerEvents = 'none'; 
    });
    
    // 显示反馈
    if (selectedIndex === correctIndex) {
        feedback.textContent = "正确！";
        feedback.classList.add('correct');
        feedback.classList.remove('incorrect');

        const questionTime = Math.min(10, time % 15); 
        const questionScore = 100 + (10 - questionTime) * 10;
        score += questionScore;
        correctAnswers++;
        
        document.getElementById('score').textContent = score;
    } else {
        feedback.textContent = "错误！";
        feedback.classList.add('incorrect');
        feedback.classList.remove('correct');
    }

    document.getElementById('nextBtn').classList.add('visible');

    document.getElementById('questionText').classList.remove('float');
}

// 下一题
function showNextQuestion() {
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        document.getElementById('questionCount').textContent = `${currentQuestion + 1}/${questions.length}`;
        showQuestion(currentQuestion);
    } else {
        endGame();
    }
}

// 游戏结束
function endGame() {
    gameActive = false;
    clearInterval(timer);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTime').textContent = time;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('gameOverScreen').classList.remove('hidden');
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
