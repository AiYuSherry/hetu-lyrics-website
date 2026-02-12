export function Footer() {
  return (
    <footer className="py-12 border-t border-ink-pale/20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* 装饰线 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-ink-pale" />
          <div className="w-2 h-2 rounded-full bg-cinnabar/30" />
          <div className="h-px w-24 bg-ink-pale" />
          <div className="w-2 h-2 rounded-full bg-cinnabar/30" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-ink-pale" />
        </div>

        {/* 制作人员信息 */}
        <div className="mb-8">
          <p className="text-sm text-ink-light tracking-wider">
            歌词整理：管涔 | 网站制作：Sherry
          </p>
        </div>

        {/* 落款 */}
        <div className="space-y-4">
          <p className="text-ink-light text-sm">
            本合集内容参考"河图作品勘鉴"项目及各位网友整理
          </p>

          {/* 印章 */}
          <div className="flex justify-center py-4">
            <div className="w-16 h-16 bg-cinnabar rounded flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold leading-tight">
                荼蘼<br/>一生
              </span>
            </div>
          </div>

          <p className="text-cinnabar text-sm tracking-wider">
            好花常有，好梦长留
          </p>

          <p className="text-ink-pale text-xs pt-4">
            © 河图歌词集 · 2007-2025
          </p>
        </div>
      </div>
    </footer>
  );
}
