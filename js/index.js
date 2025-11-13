// 核心DOM元素
const originalImage = document.getElementById('originalImage');
const splitContainer = document.getElementById('splitContainer');
const flipCards = document.querySelectorAll('.flip-card');
const splitItems = document.querySelectorAll('.split-item');
const originalImg = originalImage.querySelector('img');
const heroSection = document.getElementById('heroSection');
const mainContent = document.getElementById('mainContent');
const scrollDownHint = document.getElementById('scrollDownHint');
const scrollUpHint = document.getElementById('scrollUpHint');
const gameCards = document.querySelectorAll('.game-card');

// 图片拆分翻转核心动画
function initImageEffect() {
    splitItems.forEach(item => {
    item.style.transform = 'translateX(0) scale(1)';
    item.style.opacity = '1';
    item.classList.remove('separated');
    });
    flipCards.forEach(card => {
    card.style.transform = 'rotateZ(0deg)';
    card.style.boxShadow = 'none';
    });
    originalImage.style.visibility = 'visible';
    originalImg.style.transform = 'scale(1)';
    originalImg.style.opacity = '1';
}

function animateSplit() {
    originalImg.style.opacity = '0';
    originalImg.style.transform = 'scale(0.95)';
    setTimeout(() => {
    originalImage.style.visibility = 'hidden';
    }, 300);
    
    splitItems.forEach(item => {
    setTimeout(() => {
        const offset = item.dataset.offset;
        const scale = item.dataset.scale;
        item.style.transform = `translateX(${offset}) scale(${scale})`;
        item.classList.add('separated');
        const card = item.querySelector('.flip-card');
        card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
    }, parseInt(item.dataset.delay));
    });
}

function animateFlip() {
    flipCards.forEach((card, index) => {
    setTimeout(() => {
        const rotateAngle = splitItems[index].dataset.rotate;
        card.style.transform = `rotateY(180deg) rotateZ(${rotateAngle})`;
    }, 2000 + (index * 500));
    });
}

function animateReset() {
    flipCards.forEach((card, index) => {
    setTimeout(() => {
        card.style.transform = 'rotateY(0deg) rotateZ(0deg)';
    }, 4500 + (index * 500));
    });
}

function animateMerge() {
    splitItems.forEach((item, index) => {
    setTimeout(() => {
        item.style.transform = 'translateX(0) scale(1)';
        item.classList.remove('separated');
        const card = item.querySelector('.flip-card');
        card.style.boxShadow = 'none';
    }, 6500 + (index * 300));
    });
    
    setTimeout(() => {
    originalImage.style.visibility = 'visible';
    originalImg.style.opacity = '0';
    setTimeout(() => {
        originalImg.style.opacity = '1';
        setTimeout(() => {
        originalImg.style.transform = 'scale(1)';
        setTimeout(startAnimationCycle, 1000);
        }, 300);
    }, 50);
    }, 8000);
}

function startAnimationCycle() {
    animateSplit();
    animateFlip();
    animateReset();
    animateMerge();
}

// 太空背景核心逻辑
function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 300;
    
    for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    const x = Math.random() * 100;
    const y = Math.random() * 200;
    const size = Math.random() * 2.5 + 0.3;
    const brightness = Math.random() * 0.6 + 0.2;
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

function createMeteor() {
    const meteorsContainer = document.getElementById('meteors');
    const meteor = document.createElement('div');
    meteor.classList.add('meteor');
    
    const startX = Math.random() * window.innerWidth;
    const startY = -20;
    const length = Math.random() * 100 + 50;
    const speed = Math.random() * 13 + 7; 
    const angle = -45 + (Math.random() * 30 - 15);
    const brightness = Math.random() * 0.6 + 0.4;
    
    meteor.style.left = `${startX}px`;
    meteor.style.top = `${startY}px`;
    meteor.style.width = `${length}px`;
    meteor.style.animation = `meteorFall ${speed}s linear forwards`;
    meteor.style.transform = `rotate(${angle}deg)`;
    meteor.style.opacity = brightness;
    
    meteorsContainer.appendChild(meteor);
    
    setTimeout(() => {
    if (meteor.parentNode) meteor.remove();
    }, speed * 1000);
}

function startMeteorShower() {
    for (let i = 0; i < 3; i++) {
    setTimeout(() => createMeteor(), Math.random() * 3000);
    }
    
    setInterval(() => {
    if (Math.random() < 0.3) createMeteor();
    }, 500);
}

function initPlanets() {
    const planets = document.querySelectorAll('.planet');
    planets.forEach(planet => {
    const duration = Math.random() * 10 + 15;
    planet.style.animation = `planetFloat ${duration}s ease-in-out infinite`;
    const delay = Math.random() * 5;
    planet.style.animationDelay = `${delay}s`;
    });
}

// 页面加载初始化
window.addEventListener('load', () => {
    createStars();
    startMeteorShower();
    initPlanets();
    
    setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    
    setTimeout(() => {
        loader.style.display = 'none';
        initImageEffect();
        setTimeout(startAnimationCycle, 10);
    }, 50);
    }, 50);
});
let isAnimating = false;
// 滚动切换逻辑
function scrollToContent() {
    isAnimating = true;
    heroSection.classList.remove('section-visible');
    heroSection.classList.add('section-up');
    mainContent.classList.remove('section-down');
    mainContent.classList.add('section-visible');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    setTimeout(()=>{
    isAnimating = false;
    }, 500);
}

function scrollToHero() {
    isAnimating = true;
    mainContent.classList.remove('section-visible');
    mainContent.classList.add('section-down');
    heroSection.classList.remove('section-up');
    heroSection.classList.add('section-visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(()=>{
    isAnimating = false;
    }, 500);
}


scrollDownHint.addEventListener('click', scrollToContent);
scrollUpHint.addEventListener('click', scrollToHero);

// 滚动监听
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    if (isAnimating) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const isScrollingUp = scrollTop < lastScrollTop;
    const isScrollingDown = scrollTop > lastScrollTop;
    
    if (isScrollingDown && scrollTop > windowHeight * 0.05 && !mainContent.classList.contains('section-visible')) {
    isAnimating = true;
    scrollToContent();
    setTimeout(() => isAnimating = false, 800);
    }
    
    if (isScrollingUp && scrollTop < windowHeight * 1.4 && !heroSection.classList.contains('section-visible')) {
    isAnimating = true;
    scrollToHero();
    setTimeout(() => isAnimating = false, 800);
    }
    
    lastScrollTop = scrollTop;
});

// 按钮跳转逻辑
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
    if (this.classList.contains('game-card-button')) {
        const targetPage = this.dataset.gameLink;
        if (targetPage) window.location.href = targetPage;
    } else {
        if(this.classList.contains('btn-primary')){
            window.location.href = "pages/game-portal.html";
        }
        else{
            window.location.href = "pages/more.html";
        }
    }
    });
});

// 视频控制逻辑
gameCards.forEach(card => {
    const video = card.querySelector('video');
    
    card.addEventListener('mouseenter', () => {
    if (video) {
        video.currentTime = 0;
        video.play().catch(e => {});
    }
    });
    
    card.addEventListener('mouseleave', () => {
    if (video) {
        video.pause();
    }
    });
});
