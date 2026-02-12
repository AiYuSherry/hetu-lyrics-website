import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Music, BookOpen, Heart } from 'lucide-react';

interface HeroProps {
  onEnter: () => void;
  songCount: number;
  favoriteCount: number;
}

export function Hero({ onEnter, songCount, favoriteCount }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // 水墨背景动画
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // 简单的墨点粒子效果
    const particles: { x: number; y: number; radius: number; vx: number; vy: number; alpha: number }[] = [];
    
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 80 + 40,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.03 + 0.01,
      });
    }
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < -p.radius) p.x = canvas.width + p.radius;
        if (p.x > canvas.width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = canvas.height + p.radius;
        if (p.y > canvas.height + p.radius) p.y = -p.radius;
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(43, 43, 43, ${p.alpha})`);
        gradient.addColorStop(0.5, `rgba(43, 43, 43, ${p.alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(43, 43, 43, 0)');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 水墨背景画布 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />
      
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #8B1E1E 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, #2B2B2B 0%, transparent 70%)' }}
        />
      </div>
      
      {/* 主内容 */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* 卷轴容器 */}
        <div 
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '300ms' }}
        >
          {/* 顶部装饰线 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-ink-pale" />
            <div className="w-2 h-2 rounded-full bg-cinnabar/30" />
            <div className="h-px w-24 bg-ink-pale" />
            <div className="w-2 h-2 rounded-full bg-cinnabar/30" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-ink-pale" />
          </div>
          
          {/* 标题 */}
          <h1 
            className={`text-5xl md:text-7xl font-bold text-ink mb-4 tracking-wider transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              transitionDelay: '600ms',
              fontFamily: "'Noto Serif SC', serif",
              textShadow: '2px 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            河图歌词集
          </h1>
          
          {/* 副标题 */}
          <p 
            className={`text-xl md:text-2xl text-ink-light mb-6 tracking-widest transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '800ms' }}
          >
            2007 — 2025
          </p>
          
          {/* 描述 */}
          <p 
            className={`text-base md:text-lg text-ink-light/80 mb-10 max-w-xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '1000ms' }}
          >
            十八年音乐旅程，两百首灵魂诗篇
            <br />
            <span className="text-sm">好花常有，好梦长留</span>
          </p>
          
          {/* 统计信息 */}
          <div 
            className={`flex justify-center gap-8 md:gap-12 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '1200ms' }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-cinnabar mb-1">
                <Music className="w-4 h-4" />
                <span className="text-2xl font-bold">{songCount}</span>
              </div>
              <span className="text-xs text-ink-light">首歌曲</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-cinnabar mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-2xl font-bold">18</span>
              </div>
              <span className="text-xs text-ink-light">年历程</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-cinnabar mb-1">
                <Heart className="w-4 h-4" />
                <span className="text-2xl font-bold">{favoriteCount}</span>
              </div>
              <span className="text-xs text-ink-light">已收藏</span>
            </div>
          </div>
          
          {/* 进入按钮 */}
          <button
            onClick={onEnter}
            className={`group relative inline-flex items-center gap-2 px-8 py-3 bg-cinnabar text-white rounded transition-all duration-500 hover:bg-cinnabar-dark hover:shadow-lg hover:-translate-y-0.5 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '1400ms' }}
          >
            <span className="tracking-widest">展开卷轴</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
          
          {/* 底部装饰线 */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-ink-pale" />
            <div className="text-ink-pale text-xs tracking-widest">整理者 · 管涔</div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-ink-pale" />
          </div>
          
          {/* 制作人员信息 */}
          <div 
            className={`mt-8 pt-6 border-t border-ink-pale/20 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '1600ms' }}
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xs text-ink-light/70">
              <div className="flex items-center gap-2">
                <span className="text-cinnabar/60">歌词整理</span>
                <span className="font-medium">管涔</span>
              </div>
              <div className="hidden md:block w-px h-3 bg-ink-pale/30" />
              <div className="flex items-center gap-2">
                <span className="text-cinnabar/60">网站制作</span>
                <span className="font-medium">Sherry</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
