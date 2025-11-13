 // 游戏变量
let canvas, ctx;
let player;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let powerUps = [];
let explosions = [];
let stars = [];
let score = 0;
let lives = 3;
let level = 1;
let gameActive = false;
let lastEnemySpawn = 0;
let lastPowerUpSpawn = 0;
let keys = {};
let currentBulletType = 'normal';
let bulletPowerUpTime = 0;
let attackSpeedMultiplier = 1.0;
let attackSpeedTime = 0;

// 敌机类型
const enemyTypes = {
    normal: {
        name: '普通敌机',
        color: '#ff5555',
        width: 40,
        height: 30,
        health: 1,
        speed: 1.5,
        score: 10,
        shootDelay: 2000,
        bulletSpeed: 4,
        spawnWeight: 40,
        movement: 'straight'
    },
    heavy: {
        name: '重型敌机',
        color: '#55aa55',
        width: 50,
        height: 40,
        health: 3,
        speed: 1,
        score: 30,
        shootDelay: 1500,
        bulletSpeed: 5,
        spawnWeight: 20,
        movement: 'straight'
    },
    fast: {
        name: '快速敌机',
        color: '#5555ff',
        width: 30,
        height: 25,
        health: 1,
        speed: 3,
        score: 15,
        shootDelay: 2500,
        bulletSpeed: 3,
        spawnWeight: 25,
        movement: 'zigzag'
    },
    elite: {
        name: '精英敌机',
        color: '#aa55aa',
        width: 45,
        height: 35,
        health: 2,
        speed: 1.8,
        score: 25,
        shootDelay: 1000,
        bulletSpeed: 6,
        spawnWeight: 10,
        movement: 'sinusoidal'
    },
    boss: {
        name: 'BOSS敌机',
        color: '#ffaa00',
        width: 80,
        height: 60,
        health: 10,
        speed: 0.8,
        score: 100,
        shootDelay: 800,
        bulletSpeed: 7,
        spawnWeight: 5,
        movement: 'boss'
    }
};

// 子弹类型定义
const bulletTypes = {
    normal: { 
        name: '普通', 
        color: '#4affff',
        shoot: function() {
            bullets.push({
                x: player.x,
                y: player.y - player.height/2,
                radius: 3,
                speed: 7,
                color: this.color,
                type: 'normal',
                damage: 1
            });
        }
    },
    triple: { 
        name: '三连发', 
        color: '#ff5555',
        shoot: function() {
            for (let i = -1; i <= 1; i++) {
                bullets.push({
                    x: player.x + i * 10,
                    y: player.y - player.height/2,
                    radius: 3,
                    speed: 7,
                    color: this.color,
                    type: 'triple',
                    damage: 1
                });
            }
        }
    },
    spread: { 
        name: '散射', 
        color: '#55ff55',
        shoot: function() {
            for (let i = -2; i <= 2; i++) {
                bullets.push({
                    x: player.x,
                    y: player.y - player.height/2,
                    radius: 3,
                    speed: 7,
                    angle: i * 0.2,
                    color: this.color,
                    type: 'spread',
                    damage: 1
                });
            }
        }
    },
    laser: { 
        name: '激光', 
        color: '#5555ff',
        shoot: function() {
            bullets.push({
                x: player.x,
                y: player.y - player.height/2,
                radius: 6,
                speed: 20,
                color: this.color,
                type: 'laser',
                length: 100,
                penetration: 3,
                damage: 2
            });
        }
    },
    explosive: { 
        name: '爆炸', 
        color: '#ffff55',
        shoot: function() {
            bullets.push({
                x: player.x,
                y: player.y - player.height/2,
                radius: 4,
                speed: 6,
                color: this.color,
                type: 'explosive',
                explosionRadius: 60,
                damage: 3
            });
        }
    }
};

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    player = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        width: 50,
        height: 40,
        speed: 5,
        color: '#4a4aff',
        lastShot: 0,
        baseShootDelay: 300,
        shootDelay: 300,
        invulnerable: false,
        invulnerableTime: 0
    };
    
    createStars();
    
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    canvas.addEventListener('click', shoot);
    
    // 开始游戏
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
    score = 0;
    lives = 3;
    level = 1;
    enemies = [];
    bullets = [];
    enemyBullets = [];
    powerUps = [];
    explosions = [];
    gameActive = true;
    currentBulletType = 'normal';
    bulletPowerUpTime = 0;
    attackSpeedMultiplier = 1.0;
    attackSpeedTime = 0;
    player.shootDelay = player.baseShootDelay;
    lastEnemySpawn = 0;
    lastPowerUpSpawn = 0;
    
    // 更新UI
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    document.getElementById('powerup').textContent = bulletTypes[currentBulletType].name;
    document.getElementById('attackSpeed').textContent = attackSpeedMultiplier.toFixed(1) + 'x';
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');

    gameLoop();
}

// 游戏结束
function gameOver() {
    gameActive = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

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
    
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x += player.speed;
    }
    
    player.x = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.x));
    
    updateAttackSpeed();
    
    if (keys[' '] && Date.now() - player.lastShot > player.shootDelay) {
        shoot();
    }
    
    if (player.invulnerable) {
        if (Date.now() - player.invulnerableTime > 2000) {
            player.invulnerable = false;
        }
    }
    
    // 检查子弹时间
    if (currentBulletType !== 'normal' && Date.now() - bulletPowerUpTime > 10000) {
        currentBulletType = 'normal';
        document.getElementById('powerup').textContent = bulletTypes[currentBulletType].name;
    }
    
    // 生成敌人
    const enemySpawnRate = Math.max(500, 1000 - (level * 50));
    if (Date.now() - lastEnemySpawn > enemySpawnRate) {
        spawnEnemy();
        lastEnemySpawn = Date.now();
    }
    
    // 生成能量块
    if (Date.now() - lastPowerUpSpawn > 5000 && Math.random() < 0.1) {
        spawnPowerUp();
        lastPowerUpSpawn = Date.now();
    }
    
    // 更新敌人
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        updateEnemyMovement(enemy);
        
        // 敌人离开屏幕
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            continue;
        }
        
        // 敌人发射子弹
        if (Date.now() - enemy.lastShot > enemy.shootDelay && Math.random() < 0.01) {
            enemyShoot(enemy);
            enemy.lastShot = Date.now();
        }
        
        // 检测与玩家碰撞
        if (checkCollision(player, enemy) && !player.invulnerable) {
            takeDamage();
            createExplosion(enemy.x, enemy.y);
            enemies.splice(i, 1);
        }
    }
    
    // 更新玩家子弹
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        if (bullet.type === 'spread' && bullet.angle) {
            bullet.y -= bullet.speed * Math.cos(bullet.angle);
            bullet.x += bullet.speed * Math.sin(bullet.angle);
        } else {
            bullet.y -= bullet.speed;
        }
        
        if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(i, 1);
            continue;
        }
        
        // 检测子弹与敌人
        let hitEnemy = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (checkCollision(bullet, enemy)) {
                enemy.health -= bullet.damage || 1;
                if (enemy.health <= 0) {
                    score += enemy.score;
                    document.getElementById('score').textContent = score;
                    createExplosion(enemy.x, enemy.y);
                    enemies.splice(j, 1);
                    if (score % 200 === 0) {
                        levelUp();
                    }
                }
                
                // 子弹类型
                if (bullet.type === 'laser' && bullet.penetration > 0) {
                    bullet.penetration--;
                    if (bullet.penetration <= 0) {
                        hitEnemy = true;
                    }
                } else if (bullet.type === 'explosive') {
                    createExplosion(bullet.x, bullet.y, bullet.explosionRadius);
                    for (let k = enemies.length - 1; k >= 0; k--) {
                        const e = enemies[k];
                        if (e === enemy) continue;
                        
                        const dx = e.x - bullet.x;
                        const dy = e.y - bullet.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < bullet.explosionRadius) {
                            e.health -= bullet.damage || 1;
                            if (e.health <= 0) {
                                score += e.score;
                                document.getElementById('score').textContent = score;
                                createExplosion(e.x, e.y);
                                enemies.splice(k, 1);
                            }
                        }
                    }
                    hitEnemy = true;
                } else {
                    hitEnemy = true;
                }
            }
        }
        
        if (hitEnemy && bullet.type !== 'laser') {
            bullets.splice(i, 1);
        }
    }
    
    // 更新敌人子弹
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.y += bullet.speed;
        if (bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
            continue;
        }
        if (checkCollision(bullet, player) && !player.invulnerable) {
            takeDamage();
            enemyBullets.splice(i, 1);
        }
    }
    
    // 更新能量块
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += powerUp.speed;
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
            continue;
        }
        if (checkCollision(player, powerUp)) {
            applyPowerUp(powerUp.type);
            powerUps.splice(i, 1);
        }
    }
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.life--;
        if (explosion.life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

// 更新攻击速度状态
function updateAttackSpeed() {
    if (attackSpeedMultiplier > 1.0 && Date.now() - attackSpeedTime > 10000) {
        attackSpeedMultiplier = Math.max(1.0, attackSpeedMultiplier - 0.5);
        attackSpeedTime = Date.now();
        
        player.shootDelay = player.baseShootDelay / attackSpeedMultiplier;
        document.getElementById('attackSpeed').textContent = attackSpeedMultiplier.toFixed(1) + 'x';
        
        if (attackSpeedMultiplier === 1.0) {
            attackSpeedTime = 0;
        }
    }
}

// 更新敌机移动
function updateEnemyMovement(enemy) {
    switch (enemy.movement) {
        case 'straight':
            enemy.y += enemy.speed;
            break;
        case 'zigzag':
            enemy.y += enemy.speed;
            enemy.x += Math.sin(enemy.y * 0.05) * 2;
            break;
        case 'sinusoidal':
            enemy.y += enemy.speed;
            enemy.x += Math.sin(enemy.y * 0.03) * 3;
            break;
        case 'boss':
            enemy.y += enemy.speed;
            enemy.x += Math.sin(enemy.y * 0.02) * 4;
            break;
        default:
            enemy.y += enemy.speed;
    }
}

// 应用能量块效果
function applyPowerUp(type) {
    if (type === 'rapid') {
        attackSpeedMultiplier = Math.min(3.0, attackSpeedMultiplier + 0.5);
        attackSpeedTime = Date.now();
        player.shootDelay = player.baseShootDelay / attackSpeedMultiplier;
        document.getElementById('attackSpeed').textContent = attackSpeedMultiplier.toFixed(1) + 'x';
        
        createPowerUpEffect(player.x, player.y, type);
    } else {
        currentBulletType = type;
        bulletPowerUpTime = Date.now();
        document.getElementById('powerup').textContent = bulletTypes[type].name;
        
        createPowerUpEffect(player.x, player.y, type);
    }
}

// 创建能量块特效
function createPowerUpEffect(x, y, type) {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            createExplosion(
                x + (Math.random() - 0.5) * 50,
                y + (Math.random() - 0.5) * 50,
                20,
                type === 'rapid' ? '#ff55ff' : bulletTypes[type].color
            );
        }, i * 100);
    }
}

// 玩家受到伤害
function takeDamage() {
    lives--;
    document.getElementById('lives').textContent = lives;
    player.invulnerable = true;
    player.invulnerableTime = Date.now();
    
    if (lives <= 0) {
        gameOver();
    }
}

// 升级
function levelUp() {
    level++;
    document.getElementById('level').textContent = level;
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createExplosion(Math.random() * canvas.width, Math.random() * canvas.height);
        }, i * 50);
    }
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
    
    // 绘制玩家
    if (!player.invulnerable || Math.floor(Date.now() / 200) % 2 === 0) {
        drawShip(player.x, player.y, player.width, player.height, player.color);
    }
    
    // 绘制敌人
    enemies.forEach(enemy => {
        drawEnemy(enemy);
        
        // 绘制血条
        if (enemy.health < enemy.maxHealth) {
            drawHealthBar(enemy);
        }
    });
    
    // 绘制玩家子弹
    bullets.forEach(bullet => {
        if (bullet.type === 'laser') {
            // 激光子弹
            const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y - bullet.length);
            gradient.addColorStop(0, bullet.color);
            gradient.addColorStop(1, 'rgba(74, 74, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(bullet.x - bullet.radius, bullet.y - bullet.length, bullet.radius * 2, bullet.length);

            ctx.strokeStyle = bullet.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bullet.x, bullet.y);
            ctx.lineTo(bullet.x, bullet.y - bullet.length);
            ctx.stroke();
        } else {
            // 普通子弹
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = bullet.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y + 10, bullet.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // 敌人子弹
    enemyBullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y - 10, bullet.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制能量块
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = powerUp.color.replace(')', ', 0.7)').replace('rgb', 'rgba');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // 绘制爆炸效果
    explosions.forEach(explosion => {
        const currentRadius = explosion.radius * (explosion.life / explosion.maxLife);
        const gradient = ctx.createRadialGradient(
            explosion.x, explosion.y, 0,
            explosion.x, explosion.y, currentRadius
        );
        gradient.addColorStop(0, explosion.color || 'rgba(255, 100, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 绘制飞船
function drawShip(x, y, width, height, color) {
    ctx.fillStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(x, y - height/2);
    ctx.lineTo(x - width/2, y + height/2);
    ctx.lineTo(x + width/2, y + height/2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(x, y - height/4);
    ctx.lineTo(x - width/4, y + height/4);
    ctx.lineTo(x + width/4, y + height/4);
    ctx.closePath();
    ctx.fill();
    
    const gradient = ctx.createLinearGradient(x, y + height/2, x, y + height/2 + 10);
    gradient.addColorStop(0, 'rgba(74, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(74, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x - width/6, y + height/2);
    ctx.lineTo(x + width/6, y + height/2);
    ctx.lineTo(x, y + height/2 + 15);
    ctx.closePath();
    ctx.fill();
}

// 绘制敌机（修复方向）
function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y + enemy.height/2); 
    ctx.lineTo(enemy.x - enemy.width/2, enemy.y - enemy.height/2);  
    ctx.lineTo(enemy.x + enemy.width/2, enemy.y - enemy.height/2); 
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y + enemy.height/4);  
    ctx.lineTo(enemy.x - enemy.width/4, enemy.y - enemy.height/4);  
    ctx.lineTo(enemy.x + enemy.width/4, enemy.y - enemy.height/4);  
    ctx.closePath();
    ctx.fill();
    
    // 敌机引擎光效
    const gradient = ctx.createLinearGradient(enemy.x, enemy.y - enemy.height/2, enemy.x, enemy.y - enemy.height/2 - 10);
    gradient.addColorStop(0, enemy.color.replace(')', ', 0.8)').replace('rgb', 'rgba'));
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.width/6, enemy.y - enemy.height/2);
    ctx.lineTo(enemy.x + enemy.width/6, enemy.y - enemy.height/2);
    ctx.lineTo(enemy.x, enemy.y - enemy.height/2 - 15);
    ctx.closePath();
    ctx.fill();
}

// 绘制血条
function drawHealthBar(enemy) {
    const barWidth = enemy.width;
    const barHeight = 4;
    const barX = enemy.x - barWidth/2;
    const barY = enemy.y - enemy.height/2 - 10;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthPercent = enemy.health / enemy.maxHealth;
    ctx.fillStyle = enemy.health > enemy.maxHealth/2 ? '#00ff00' : 
                    enemy.health > enemy.maxHealth/4 ? '#ffff00' : '#ff0000';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
}

// 发射子弹
function shoot() {
    if (Date.now() - player.lastShot > player.shootDelay) {
        bulletTypes[currentBulletType].shoot();
        player.lastShot = Date.now();
    }
}

// 敌人发射子弹
function enemyShoot(enemy) {
    enemyBullets.push({
        x: enemy.x,
        y: enemy.y + enemy.height/2,  
        radius: 4,
        speed: enemy.bulletSpeed,
        color: enemy.color
    });
}

// 生成敌人
function spawnEnemy() {
    const enemyType = getRandomEnemyType();
    const typeConfig = enemyTypes[enemyType];
    
    const levelMultiplier = 1 + (level - 1) * 0.1;
    
    enemies.push({
        x: Math.random() * (canvas.width - typeConfig.width) + typeConfig.width/2,
        y: -typeConfig.height,
        width: typeConfig.width,
        height: typeConfig.height,
        speed: typeConfig.speed * levelMultiplier,
        color: typeConfig.color,
        health: typeConfig.health,
        maxHealth: typeConfig.health,
        score: typeConfig.score,
        lastShot: 0,
        shootDelay: typeConfig.shootDelay / levelMultiplier,
        bulletSpeed: typeConfig.bulletSpeed * levelMultiplier,
        type: enemyType,
        movement: typeConfig.movement
    });
}

// 随机选择敌机类型
function getRandomEnemyType() {
    const types = Object.keys(enemyTypes);
    const weights = types.map(type => enemyTypes[type].spawnWeight);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < types.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return types[i];
        }
    }
    
    return types[0];
}

// 生成能量块
function spawnPowerUp() {
    const powerUpTypes = ['triple', 'spread', 'laser', 'explosive', 'rapid'];
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    let color;
    if (type === 'rapid') {
        color = '#ff55ff';
    } else {
        color = bulletTypes[type].color;
    }
    
    powerUps.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: -20,
        radius: 10,
        speed: 2,
        color: color,
        type: type
    });
}

// 创建爆炸效果
function createExplosion(x, y, radius = 30, color = null) {
    explosions.push({
        x: x,
        y: y,
        radius: radius,
        life: 20,
        maxLife: 20,
        color: color
    });
}

// 检测碰撞
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const radius1 = obj1.radius || (obj1.width + obj1.height) / 4;
    const radius2 = obj2.radius || (obj2.width + obj2.height) / 4;
    
    return distance < radius1 + radius2;
}
function backToMenu() {
    window.history.back();
}
const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', backToMenu);

// 页面加载完成后初始化游戏
window.addEventListener('load', init);