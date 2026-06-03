import React from 'react';
import { API_CONFIG } from './config/api';
import GrowwFuturesDashboard from './GrowwFuturesDashboard';

export default function AnshulGrowwDashboard() {
  return (
    <GrowwFuturesDashboard
      accountName="Anshul"
      baseUrl={API_CONFIG.ANSHUL_BASE_URL}
      userId={3}
      initialStrategy="TEST_ANSHUL"
      strategyOptions={['TEST_ANSHUL', 'EMA_CROSS_9_50']}
    />
  );
}
