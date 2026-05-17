import { RealEstateCard } from '@/components/agi-hub/RealEstateCard';
import React from 'react';

// 動態組件註冊表：將所有專家大腦對應的 Generative UI 卡片掛載於此
export const GenUIRegistry: Record<string, React.FC<any>> = {
  'real_estate_card': RealEstateCard,
  // 未來可水平擴充：
  // 'tender_card': TenderStrategyCard,
  // 'legal_card': LegalRiskCard,
};
