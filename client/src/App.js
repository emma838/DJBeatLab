import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Workspace from './pages/Workspace/Workspace'; 
import PrivateRoute from './routing/PrivateRoute'; // Import nowego komponentu PrivateRoute

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trasy publiczne */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Trasy chronione */}
        <Route path="/workspace" element={<PrivateRoute element={<Workspace />} />} />

        {/* Przekierowanie na stronę logowania dla niezalogowanych użytkowników */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
