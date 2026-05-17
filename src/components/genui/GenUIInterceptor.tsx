'use client';

import React from 'react';
import { GenUIRegistry } from './GenUIRegistry';

interface GenUIInterceptorProps {
  content: string;
}

export const GenUIInterceptor: React.FC<GenUIInterceptorProps> = ({ content }) => {
  if (!content) return null;

  // 1. 使用正則表達式尋找帶有 genui 標籤的 Markdown JSON 區塊
  // 支援格式: ```json genui:real_estate_card ... ``` 或單純 ```json genui:xxx
  const match = content.match(/```json\s+genui:([a-zA-Z0-9_]+)\s*\n([\s\S]*?)\n```/);

  if (!match) {
    // 若無匹配，則將原文字進行基本的換行渲染或交給外層顯示
    return (
      <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base">
        {content}
      </div>
    );
  }

  const componentType = match[1]; // 例如 'real_estate_card'
  const jsonString = match[2];

  try {
    const data = JSON.parse(jsonString);
    const TargetComponent = GenUIRegistry[componentType];

    if (!TargetComponent) {
      throw new Error(`找不到對應的 Generative UI 組件: ${componentType}`);
    }

    // 2. 成功解析：取得 JSON 之外的引言 (Lead text)，並於下方渲染奢華視覺卡片
    const leadText = content.replace(match[0], '').trim();

    return (
      <div className="space-y-6 w-full my-2">
        {leadText && (
          <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base">
            {leadText}
          </div>
        )}
        <div className="w-full animate-in fade-in zoom-in-95 duration-500 ease-out">
          <TargetComponent {...data} />
        </div>
      </div>
    );
  } catch (err: any) {
    console.error('Generative UI 解析失敗:', err);
    // 3. 優雅降級：若 JSON 解析失敗或串流未完成，顯示精美載入中提示與原文字
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 animate-pulse">
          ⚡ 智慧視覺圖表正在生成或解析中 ({err?.message || 'JSON 串流中'})...
        </div>
        <div className="text-slate-400 whitespace-pre-wrap text-xs opacity-70">
          {content}
        </div>
      </div>
    );
  }
};
