import React from 'react';
import { BrandProvider } from './BrandProvider';
import { PremiumCanvas, GlassCard } from './components';

const DemoPage = () => {
  return (
    <BrandProvider initialTheme="glassmorphism">
      <PremiumCanvas 
        title="AI Advisor Pro" 
        subtitle="Artisan Brain Module: Strategic Market Intelligence Report"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          
          <GlassCard label="Analysis Objective" icon="🎯">
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              本報告旨在分析 AGI 導航樞紐在多租戶環境下的視覺競爭力。
              透過整合 Open-Design 規範，我們將原本的工程師介面轉化為具備「劇場感」的專業品牌畫布。
            </p>
          </GlassCard>

          <GlassCard label="Design Strategy" icon="✨">
            <ul style={{ paddingLeft: '20px', lineHeight: 2 }}>
              <li>採用 Glassmorphism 毛玻璃特效提升層次感</li>
              <li>Plus Jakarta Sans 現代排版系統</li>
              <li>動態響應式佈局 (The Canvas)</li>
              <li>品牌級調色盤：活力藍 (#1856FF)</li>
            </ul>
          </GlassCard>

          <GlassCard label="Projected ROI" icon="📈">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px' }}>
              <div style={{ width: '20%', height: '40%', background: 'var(--brand-primary)', borderRadius: '8px', opacity: 0.4 }}></div>
              <div style={{ width: '20%', height: '60%', background: 'var(--brand-primary)', borderRadius: '8px', opacity: 0.6 }}></div>
              <div style={{ width: '20%', height: '90%', background: 'var(--brand-primary)', borderRadius: '8px', opacity: 1 }}></div>
              <div style={{ width: '20%', height: '75%', background: 'var(--brand-primary)', borderRadius: '8px', opacity: 0.8 }}></div>
            </div>
            <p style={{ marginTop: '16px', fontSize: '0.9rem', opacity: 0.7 }}>
              預期提升客戶轉化率 45%，並增加 2.5 倍的品牌專業信任度。
            </p>
          </GlassCard>

        </div>
      </PremiumCanvas>
    </BrandProvider>
  );
};

export default DemoPage;
