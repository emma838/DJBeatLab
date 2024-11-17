import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Workspace from './pages/Workspace/Workspace'; 
import PrivateRoute from './routing/PrivateRoute';
import { AudioProvider } from './components/AudioManager/AudioManager';

axios.defaults.baseURL = 'http://localhost:5000/';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Accept-Charset'] = 'utf-8';
axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trasy publiczne */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />

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
