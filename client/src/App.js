import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Workspace from './pages/Workspace/Workspace'; 
import PrivateRoute from './routing/PrivateRoute';
import { AudioProvider } from './components/AudioManager/AudioManager';

axios.defaults.baseURL = 'http://localhost:5000/';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trasy publiczne */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Trasa chroniona z AudioProvider */}
        <Route
          path="/workspace"
          element={
            <PrivateRoute element={
              <AudioProvider>
                <Workspace />
              </AudioProvider>
            } />
          }
        />

        {/* Przekierowanie na stronę logowania dla niezalogowanych użytkowników */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
