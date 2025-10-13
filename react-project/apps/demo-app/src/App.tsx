import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import TasksDemo from './pages/TasksDemo';
import StateMachineDemo from './pages/StateMachineDemo';
import ApiDemo from './pages/ApiDemo';
import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks/*" element={<TasksDemo />} />
          <Route path="/statemachine/*" element={<StateMachineDemo />} />
          <Route path="/api" element={<ApiDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;

