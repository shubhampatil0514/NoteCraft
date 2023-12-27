import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Login from './components/LoginPage';
import Signup from './components/SignupPage';
import Dashboard from './components/TaskDashboard';


function App() { 
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router> 
  );
}

export default App;
