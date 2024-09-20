// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

const App = () => {
    return (
      <Router>
        <Routes>
          {/* Trasa dla komponentu Register */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/secure" element={<h2>Strona chroniona</h2>} /> 
        </Routes>
      </Router>
    );
  };
  
  export default App;
