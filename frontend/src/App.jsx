import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Builds from './pages/Builds';
import BuildDetail from './pages/BuildDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="builds" element={<Builds />} />
          <Route path="builds/:id" element={<BuildDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;