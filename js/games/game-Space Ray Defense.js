// 游戏变量
let canvas, ctx;
let score = 0;
let lives = 3;
let gameOver = false;
let shieldAngle = 0;
const SHIELD_WIDTH = Math.PI / 8;
const SHIELD_RADIUS = 80;
const CORE_RADIUS = 40;
const GUIDE_RADIUS = 800;

// 射线数组
let rays = [];
let missiles = [];
let raySpeed = 2;
let raySpawnRate = 1000;
let lastRaySpawn = 0;
let missileSpawnRate = 1500;
let lastMissileSpawn = 0;

// 星星数组
let stars = [];

// 星球坑洞数组
let craters = [];

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    createStars();
    createCraters();
    
    canvas.addEventListener('mousemove', handleMouseMove);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('startBtn').addEventListener('click', startGame);
}

// 开始游戏
function startGame() {
    startScreen.classList.add('hidden');
    gameOver = false;
    score = 0;
    lives = 3;
    rays = [];
    missiles = [];
    
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    
    gameLoop();
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

// 创建星球坑洞
function createCraters() {
    craters = [];
    const craterCount = 15;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < craterCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * CORE_RADIUS * 0.8;
        
        craters.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            radius: Math.random() * 5 + 2,
            depth: Math.random() * 0.3 + 0.1
        });
    }
}

// 处理鼠标移动
function handleMouseMove(e) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    shieldAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
}

// 生成新射线
function spawnRay() {
    const now = Date.now();
    if (now - lastRaySpawn < raySpawnRate) return;
    
    lastRaySpawn = now;
    
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    switch(edge) {
        case 0:
            x = Math.random() * canvas.width;
            y = 0;
            break;
        case 1:
            x = canvas.width;
            y = Math.random() * canvas.height;
            break;
        case 2:
            x = Math.random() * canvas.width;
            y = canvas.height;
            break;
        case 3:
            x = 0;
            y = Math.random() * canvas.height;
            break;
    }
    
    const dx = centerX - x;
    const dy = centerY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    rays.push({
        x: x,
        y: y,
        vx: dx / distance * raySpeed,
        vy: dy / distance * raySpeed,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`,
        width: Math.random() * 2 + 1
    });
}

// 生成随机飞弹
function spawnMissile() {
    const now = Date.now();
    if (now - lastMissileSpawn < missileSpawnRate) return;
    
    lastMissileSpawn = now;
    
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    switch(edge) {
        case 0:
            x = Math.random() * canvas.width;
            y = 0;
            break;
        case 1:
            x = canvas.width;
            y = Math.random() * canvas.height;
            break;
        case 2:
            x = Math.random() * canvas.width;
            y = canvas.height;
            break;
        case 3:
            x = 0;
            y = Math.random() * canvas.height;
            break;
    }
    
    let targetX, targetY;
    if (Math.random() < 0.3) {
        targetX = centerX;
        targetY = centerY;
    } else {
        targetX = Math.random() * canvas.width;
        targetY = Math.random() * canvas.height;
    }
    
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    missiles.push({
        x: x,
        y: y,
        vx: dx / distance * (raySpeed * 0.7),
        vy: dy / distance * (raySpeed * 0.7),
        color: `hsl(${Math.random() * 60 + 300}, 100%, 70%)`,
        width: Math.random() * 2 + 1,
        isDangerous: Math.random() < 0.3
    });
}

// 更新射线位置
function updateRays() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = rays.length - 1; i >= 0; i--) {
        const ray = rays[i];
        
        ray.x += ray.vx;
        ray.y += ray.vy;
        
        const dx = ray.x - centerX;
        const dy = ray.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CORE_RADIUS) {
            lives--;
            updateUI();
            rays.splice(i, 1);
            
            if (lives <= 0) {
                endGame();
            }
            continue;
        }
        
        if (isRayBlocked(ray)) {
            score += 10;
            updateUI();
            rays.splice(i, 1);
            continue;
        }
        
        if (ray.x < -50 || ray.x > canvas.width + 50 || 
            ray.y < -50 || ray.y > canvas.height + 50) {
            rays.splice(i, 1);
        }
    }
}

// 更新飞弹位置
function updateMissiles() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        
        missile.x += missile.vx;
        missile.y += missile.vy;
        
        if (missile.isDangerous) {
            const dx = missile.x - centerX;
            const dy = missile.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CORE_RADIUS) {
                lives--;
                updateUI();
                missiles.splice(i, 1);
                
                if (lives <= 0) {
                    endGame();
                }
                continue;
            }
        }
        
        if (isRayBlocked(missile)) {
            score += 5;
            updateUI();
            missiles.splice(i, 1);
            continue;
        }
        
        if (missile.x < -50 || missile.x > canvas.width + 50 || 
            missile.y < -50 || missile.y > canvas.height + 50) {
            missiles.splice(i, 1);
        }
    }
}

// 检查射线/飞弹是否被护盾阻挡
function isRayBlocked(ray) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const dx = ray.x - centerX;
    const dy = ray.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < SHIELD_RADIUS) {
        const rayAngle = Math.atan2(dy, dx);
        
        let angleDiff = rayAngle - shieldAngle;
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        return Math.abs(angleDiff) < SHIELD_WIDTH / 2;
    }
    
    return false;
}

// 绘制游戏元素
function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    drawGuideLines();
    drawPlanet();
    drawShield();
    drawRays();
    drawMissiles();
}

// 绘制星星背景
function drawStars() {
    ctx.save();
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    });
    ctx.restore();
}

// 绘制防御范围引导线
function drawGuideLines() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(shieldAngle);
    
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 168, 255, 0.5)';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
        Math.cos(-SHIELD_WIDTH/2) * GUIDE_RADIUS,
        Math.sin(-SHIELD_WIDTH/2) * GUIDE_RADIUS
    );
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
        Math.cos(SHIELD_WIDTH/2) * GUIDE_RADIUS,
        Math.sin(SHIELD_WIDTH/2) * GUIDE_RADIUS
    );
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(0, 0, GUIDE_RADIUS, -SHIELD_WIDTH/2, SHIELD_WIDTH/2);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.restore();
}

// 绘制星球核心
function drawPlanet() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    
    const gradient = ctx.createRadialGradient(
        centerX, centerY, CORE_RADIUS * 0.5,
        centerX, centerY, CORE_RADIUS
    );
    gradient.addColorStop(0, '#4a4a4a');
    gradient.addColorStop(1, '#2a2a2a');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, CORE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.beginPath();
    for (let i = 0; i < 360; i += 15) {
        const angle = i * Math.PI / 180;
        const x = centerX + Math.cos(angle) * CORE_RADIUS * 0.9;
        const y = centerY + Math.sin(angle) * CORE_RADIUS * 0.9;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    craters.forEach(crater => {
        ctx.beginPath();
        ctx.arc(
            crater.x - crater.radius * 0.3,
            crater.y - crater.radius * 0.3,
            crater.radius,
            0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(30, 30, 30, ${crater.depth})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
            crater.x + crater.radius * 0.2,
            crater.y + crater.radius * 0.2,
            crater.radius * 0.7,
            0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(80, 80, 80, ${crater.depth * 0.5})`;
        ctx.fill();
    });
    
    ctx.restore();
}

// 绘制护盾
function drawShield() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(shieldAngle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, SHIELD_RADIUS, -SHIELD_WIDTH/2, SHIELD_WIDTH/2);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, -SHIELD_RADIUS/2, 0, SHIELD_RADIUS);
    gradient.addColorStop(0, 'rgba(0, 168, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 168, 255, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#00a8ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
}

// 绘制射线
function drawRays() {
    rays.forEach(ray => {
        ctx.save();
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = ray.color;
        
        ctx.beginPath();
        ctx.moveTo(ray.x, ray.y);
        
        const length = 20;
        ctx.lineTo(ray.x - ray.vx * length, ray.y - ray.vy * length);
        
        ctx.strokeStyle = ray.color;
        ctx.lineWidth = ray.width;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.restore();
    });
}

// 绘制飞弹
function drawMissiles() {
    missiles.forEach(missile => {
        ctx.save();
        
        ctx.shadowBlur = missile.isDangerous ? 15 : 5;
        ctx.shadowColor = missile.color;
        
        ctx.beginPath();
        ctx.moveTo(missile.x, missile.y);
        
        const length = missile.isDangerous ? 30 : 15;
        ctx.lineTo(missile.x - missile.vx * length, missile.y - missile.vy * length);
        
        ctx.strokeStyle = missile.color;
        ctx.lineWidth = missile.width;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        if (missile.isDangerous) {
            ctx.beginPath();
            ctx.arc(missile.x, missile.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = missile.color;
            ctx.fill();
        }
        
        ctx.restore();
    });
}

// 更新UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// 增加游戏难度
function increaseDifficulty() {
    const difficultyLevel = Math.floor(score / 1000);
    raySpeed = 2 + difficultyLevel * 0.5;
    raySpawnRate = Math.max(200, 1000 - difficultyLevel * 100);
    missileSpawnRate = Math.max(500, 1500 - difficultyLevel * 150);
}

// 游戏结束
function endGame() {
    gameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// 重新开始游戏
function restartGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

// 游戏主循环
function gameLoop() {
    if (!gameOver) {
        spawnRay();
        spawnMissile();
        updateRays();
        updateMissiles();
        increaseDifficulty();
        draw();
    }
    
    requestAnimationFrame(gameLoop);
}

function backToMenu() {
    window.history.back();
}

const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', backToMenu);

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', init);