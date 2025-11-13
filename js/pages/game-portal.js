// 创建星空背景
function createStars() {
  const starsContainer = document.getElementById('stars');
  const starCount = 300;
  
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    // 随机位置
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // 随机大小和亮度
    const size = Math.random() * 2.5 + 0.3;
    const brightness = Math.random() * 0.6 + 0.2;
    
    // 随机速度
    const baseSpeed = Math.random() * 3 + 2; 
    star.dataset.baseSpeed = baseSpeed;
    
    // 随机动画
    const delay = Math.random() * 4;
    const twinkleDuration = Math.random() * 2 + 1;
    
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.opacity = brightness;
    star.style.animationDelay = `${delay}s`;
    star.style.animationDuration = `${twinkleDuration}s`;
    
    starsContainer.appendChild(star);
  }
}

// 创建流星效果
function createMeteor() {
  const meteorsContainer = document.getElementById('meteors');
  const meteor = document.createElement('div');
  meteor.classList.add('meteor');
  
  // 随机位置（从屏幕顶部开始）
  const startX = Math.random() * window.innerWidth;
  const startY = -20;
  
  meteor.style.left = `${startX}px`;
  meteor.style.top = `${startY}px`;
  
  // 随机大小和速度
  const length = Math.random() * 100 + 50; // 50-150px
  const speed = Math.random() * 13 + 7; 
  
  meteor.style.width = `${length}px`;
  meteor.style.animation = `meteorFall ${speed}s linear forwards`;
  
  // 随机角度
  const angle = -45 + (Math.random() * 30 - 15); 
  meteor.style.transform = `rotate(${angle}deg)`;
  
  // 随机亮度
  const brightness = Math.random() * 0.6 + 0.4;
  meteor.style.opacity = brightness;
  
  meteorsContainer.appendChild(meteor);
  
  // 动画结束后移除流星
  setTimeout(() => {
    if (meteor.parentNode) {
      meteor.remove();
    }
  }, speed * 1000);
}

// 开始流星雨
function startMeteorShower() {
  // 创建初始流星
  for (let i = 0; i < 3; i++) {
    setTimeout(() => createMeteor(), Math.random() * 3000);
  }
  
  // 设置定期创建流星
  setInterval(() => {
    if (Math.random() < 0.3) {
      createMeteor();
    }
  }, 500);
}

// 初始化星球
function initPlanets() {
  const planets = document.querySelectorAll('.planet');
  planets.forEach(planet => {
    const duration = Math.random() * 10 + 15; 
    planet.style.animation = `planetFloat ${duration}s ease-in-out infinite`;
    const delay = Math.random() * 5;
    planet.style.animationDelay = `${delay}s`;
  });
}

// 处理滚动事件
function handleScroll() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  const maxScroll = documentHeight - windowHeight;
  const scrollPercentage = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
  
  // 控制火焰显示
  const flameContainer = document.getElementById('flame-container');
  if (scrollPercentage > 15) {
    const flameHeight = Math.min(scrollPercentage * 1.6, 140);
    flameContainer.style.height = `${flameHeight}px`;
    
    const flames = flameContainer.children;
    Array.from(flames).forEach((flame, index) => {
      const opacity = Math.min(scrollPercentage / 18 - (index * 0.08), 0.9);
      flame.style.opacity = Math.max(opacity, 0);
    });
  } else {
    flameContainer.style.height = '0';
  }
  
  // 控制星星移动速度（随滚动进度增加而加快）
  const stars = document.querySelectorAll('.star');
  if (scrollPercentage >= 15) {
    const speedMultiplier = 1 + (scrollPercentage / 10); 
    stars.forEach(star => {
      const baseSpeed = parseFloat(star.dataset.baseSpeed);
      const duration = baseSpeed / speedMultiplier;
      star.style.animation = `twinkle 2s infinite alternate, starMove ${duration}s linear infinite`;

      const currentTop = parseFloat(star.style.top) || 0;
      if (currentTop > 100) {
        star.style.top = '-5%';
      }
    });
  } else {
    stars.forEach(star => {
      star.style.animation = `twinkle 2s infinite alternate`;
    });
  }
  
  // 控制流星频率（随滚动进度增加而增加）
  if (scrollPercentage > 20) {
    clearInterval(meteorInterval);
    meteorInterval = setInterval(() => {
      if (Math.random() < 0.4 + (scrollPercentage / 200)) {
        createMeteor();
      }
    }, 300);
  }
  
  // 控制内容面板显示
  const panels = document.querySelectorAll('.content-panel');
  panels.forEach(panel => {
    const range = JSON.parse(panel.dataset.scrollRange);
    const [min, max] = range;
    
    if (scrollPercentage >= min && scrollPercentage < max) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

let meteorInterval;

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  createStars();
  startMeteorShower();
  initPlanets();
  handleScroll();
  window.addEventListener('scroll', handleScroll);
});

// 初始化时绑定所有视频的点击事件
window.addEventListener('DOMContentLoaded', () => {
  const videos = document.querySelectorAll('video');
  
  videos.forEach((video) => { 
    video.addEventListener('click', () => {
      const gameUrl = video.dataset.gameUrl;
      if (gameUrl) {
        window.location.href = gameUrl;
      }
    });
  });
});

// 格式化时间
function formatTime(hours, minutes) {
const formattedHours = hours.toString().padStart(2, '0');
const formattedMinutes = minutes.toString().padStart(2, '0');
return `${formattedHours}:${formattedMinutes}`;
}

// 获取并显示时间
function displayCurrentTime() {
const now = new Date();

const utcHours = now.getUTCHours();
const utcMinutes = now.getUTCMinutes();
const utcTimeStr = formatTime(utcHours, utcMinutes);

const beijingHours = (utcHours + 8) % 24;
const beijingMinutes = now.getUTCMinutes();
const beijingTimeStr = formatTime(beijingHours, beijingMinutes);

const utcTimeElement = document.getElementById('currentUtcTime');
const beijingTimeElement = document.getElementById('currentBeijngTime');
if (utcTimeElement && beijingTimeElement) {
  utcTimeElement.textContent = utcTimeStr;
  beijingTimeElement.textContent = beijingTimeStr;
}
}

// 页面加载时立即显示时间
window.addEventListener('DOMContentLoaded', displayCurrentTime);
