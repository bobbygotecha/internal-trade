import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AnshulGrowwDashboard from './AnshulGrowwDashboard';

/**
 * Main app lives at `/`. Anshul’s GROW futures dashboard lives at `/anshul`
 * (e.g. https://internal-trade.vercel.app/anshul when the site root is the Vercel project).
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/anshul" element={<AnshulGrowwDashboard />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
