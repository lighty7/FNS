import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthGuard>
      <FinanceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="setup" element={<Setup />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </FinanceProvider>
    </AuthGuard>
  );
}

export default App;