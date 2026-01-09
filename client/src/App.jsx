// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import VistaCredencial from './pages/VistaCredencial';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/credencial/:id" element={<VistaCredencial />} />
      </Routes>
    </Router>
  );
}

export default App;