// 等待DOM加载完成后执行（避免获取不到页面元素）
document.addEventListener('DOMContentLoaded', function() {
    // 游戏核心变量
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreElement = document.getElementById('finalScore');
    const finalTimeElement = document.getElementById('finalTime');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const backBtn = document.getElementById('backBtn');

    let gameRunning = false;
    let score = 0;
    let gameTime = 0;
    let lastTime = 0;
    let stars = [];

    // 飞船配置
    const ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 15,
        color: '#ff9800',
        speedX: 0,
        speedY: 0,
        thrust: 0.2, // 推力大小
        friction: 0.98 // 空气摩擦
    };

    // 黑洞配置（固定位置，随机质量）
    const blackHoles = [
        { x: 200, y: 200, radius: 30, mass: 500 },
        { x: 600, y: 400, radius: 40, mass: 800 },
        { x: 400, y: 500, radius: 25, mass: 300 },
        { x: 700, y: 200, radius: 35, mass: 600 }
    ];

    // 按键状态
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

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

    // 初始化游戏
    function initGame() {
        // 重置飞船状态
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;
        ship.speedX = 0;
        ship.speedY = 0;

        // 重置分数和时间
        score = 0;
        gameTime = 0;
        lastTime = performance.now();

        // 更新UI
        scoreElement.textContent = score;
        timeElement.textContent = gameTime.toFixed(1);

        // 隐藏结束界面，显示画布
        gameOverScreen.classList.add('hidden');
    }

    // 开始游戏
    function startGame() {
        startScreen.classList.add('hidden');
        gameRunning = true;
        initGame();
        requestAnimationFrame(gameLoop);
    }

    // 重新开始游戏
    function restartGame() {
        gameOverScreen.classList.add('hidden');
        gameRunning = true;
        initGame();
        requestAnimationFrame(gameLoop);
    }

    // 返回主菜单函数
    function backToMenu() {
        gameRunning = false;
        window.history.back();
    }

    // 游戏主循环
    function gameLoop(timestamp) {
        if (!gameRunning) return;

        // 计算时间差（控制游戏速度）
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // 更新游戏时间和分数
        gameTime += deltaTime / 1000;
        score = Math.floor(gameTime * 10); // 每秒得10分
        scoreElement.textContent = score;
        timeElement.textContent = gameTime.toFixed(1);

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制星空背景
        drawStars();

        // 处理输入（更新飞船速度）
        handleInput();

        // 应用黑洞引力
        applyGravity();

        // 应用摩擦（让飞船不会无限加速）
        ship.speedX *= ship.friction;
        ship.speedY *= ship.friction;

        // 更新飞船位置
        ship.x += ship.speedX;
        ship.y += ship.speedY;

        // 碰撞检测（黑洞边缘 + 屏幕边界）
        if (checkCollisions()) {
            endGame();
            return;
        }

        // 绘制所有元素
        drawBlackHoles();
        drawShip();

        // 继续循环
        requestAnimationFrame(gameLoop);
    }

    // 绘制星星背景
    function drawStars() {
        // 移动星星
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });

        // 绘制星星
        ctx.fillStyle = 'white';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 处理方向键输入
    function handleInput() {
        if (keys.ArrowUp) ship.speedY -= ship.thrust;
        if (keys.ArrowDown) ship.speedY += ship.thrust;
        if (keys.ArrowLeft) ship.speedX -= ship.thrust;
        if (keys.ArrowRight) ship.speedX += ship.thrust;
    }

    // 应用黑洞引力
    function applyGravity() {
        blackHoles.forEach(hole => {
            // 计算飞船到黑洞的距离
            const dx = hole.x - ship.x;
            const dy = hole.y - ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 简化引力公式：加速度 = 质量 / 距离²（避免除以0）
            if (distance > 0) {
                const gravityAccel = hole.mass / (distance * distance);
                // 沿黑洞方向加速飞船
                ship.speedX += (dx / distance) * gravityAccel;
                ship.speedY += (dy / distance) * gravityAccel;
            }
        });
    }

    // 碰撞检测
    function checkCollisions() {
        // 1. 检测飞船是否飞出屏幕
        if (
            ship.x - ship.radius < 0 || 
            ship.x + ship.radius > canvas.width || 
            ship.y - ship.radius < 0 || 
            ship.y + ship.radius > canvas.height
        ) {
            return true;
        }

        // 2. 检测飞船是否触碰黑洞边缘
        for (const hole of blackHoles) {
            const dx = hole.x - ship.x;
            const dy = hole.y - ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < hole.radius + ship.radius) {
                return true;
            }
        }

        return false;
    }

    // 绘制黑洞（黑色圆形 + 渐变阴影）
    function drawBlackHoles() {
        blackHoles.forEach(hole => {
            // 创建径向渐变（中心黑，边缘深灰）
            const gradient = ctx.createRadialGradient(
                hole.x, hole.y, 0,
                hole.x, hole.y, hole.radius
            );
            gradient.addColorStop(0, '#000');
            gradient.addColorStop(0.7, '#111');
            gradient.addColorStop(1, '#222');

            // 绘制黑洞主体
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // 绘制黑洞光环（增强视觉效果）
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(50, 50, 100, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 添加吸积盘效果
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius + 15, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(74, 74, 255, 0.2)';
            ctx.lineWidth = 3;
            ctx.stroke();
        });
    }

    // 绘制飞船（三角形 + 中心圆点）
    function drawShip() {
        ctx.save();
        // 让飞船朝向运动方向
        const angle = Math.atan2(ship.speedY, ship.speedX);
        ctx.translate(ship.x, ship.y);
        ctx.rotate(angle + Math.PI / 2); // 向上为正方向
        
        const width = ship.radius * 3;
        const height = ship.radius * 2;

        // 绘制飞船发光效果
        if (keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight) {
            const glowGradient = ctx.createRadialGradient(
                0, 0, ship.radius/2,
                0, 0, ship.radius*2
            );
            glowGradient.addColorStop(0, 'rgba(74, 255, 255, 0.8)');
            glowGradient.addColorStop(1, 'rgba(74, 255, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(0, 0, ship.radius*2, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
        }

        // 飞船主体（三角形）
        const shipGradient = ctx.createLinearGradient(0, -height/2, 0, height/2);
        shipGradient.addColorStop(0, '#4a4aff');
        shipGradient.addColorStop(0.7, '#3a3aff');
        shipGradient.addColorStop(1, '#2a2aff');
        
        ctx.fillStyle = shipGradient;
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(-width/2, height/2);
        ctx.lineTo(width/2, height/2);
        ctx.closePath();
        ctx.fill();
        
        // 飞船轮廓线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 飞船内部细节（小三角形）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(0, -height/4);
        ctx.lineTo(-width/4, height/4);
        ctx.lineTo(width/4, height/4);
        ctx.closePath();
        ctx.fill();

        // 飞船引擎效果
        if (keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight) {
            // 引擎核心（三角形尾焰）
            const engineGradient = ctx.createLinearGradient(0, height/2, 0, height/2 + 30);
            engineGradient.addColorStop(0, 'rgba(74, 255, 255, 0.9)');
            engineGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.7)');
            engineGradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
            
            ctx.fillStyle = engineGradient;
            ctx.beginPath();
            ctx.moveTo(-width/6, height/2);
            ctx.lineTo(width/6, height/2);
            ctx.lineTo(0, height/2 + 30);
            ctx.closePath();
            ctx.fill();
            
            // 引擎粒子效果
            for (let i = 0; i < 8; i++) {
                const length = 20 + Math.random() * 30;
                const width = 5 + Math.random() * 10;
                const offsetX = (Math.random() - 0.5) * width/3;
                
                ctx.beginPath();
                ctx.moveTo(offsetX - width/2, height/2);
                ctx.lineTo(offsetX + width/2, height/2);
                ctx.lineTo(offsetX, height/2 + length);
                ctx.closePath();
                
                const particleAlpha = 0.5 + Math.random() * 0.5;
                ctx.fillStyle = `rgba(100, ${Math.floor(200 + Math.random() * 55)}, 255, ${particleAlpha})`;
                ctx.fill();
            }
        }

        // 飞船舷窗（圆形）
        ctx.beginPath();
        ctx.arc(0, -height/6, ship.radius/5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    // 结束游戏
    function endGame() {
        gameRunning = false;
        // 更新结束界面数据
        finalScoreElement.textContent = score;
        finalTimeElement.textContent = gameTime.toFixed(1);
        // 显示结束界面
        gameOverScreen.classList.remove('hidden');
    }

    // 监听键盘事件
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });

    // 设置按钮事件监听器
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    backBtn.addEventListener('click', backToMenu);

    // 初始化星星背景
    createStars();
});