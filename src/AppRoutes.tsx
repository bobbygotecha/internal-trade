import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AnshulGrowwDashboard from './AnshulGrowwDashboard';
import HimanshuGrowwDashboard from './HimanshuGrowwDashboard';

/**
 * Main app lives at `/`. Per-user GROW futures dashboards: `/anshul`, `/himanshu`.
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/anshul" element={<AnshulGrowwDashboard />} />
        <Route path="/himanshu" element={<HimanshuGrowwDashboard />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
