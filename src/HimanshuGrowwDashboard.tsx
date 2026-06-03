import React from 'react';
import { API_CONFIG } from './config/api';
import GrowwFuturesDashboard from './GrowwFuturesDashboard';

export default function HimanshuGrowwDashboard() {
  return (
    <GrowwFuturesDashboard
      accountName="Himanshu"
      baseUrl={API_CONFIG.HIMANSHU_BASE_URL}
      userId={5}
      initialStrategy="TEST_HIMANSHU"
      strategyOptions={['TEST_HIMANSHU', 'EMA_CROSS_9_50']}
    />
  );
}
