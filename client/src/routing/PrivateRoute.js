import React from 'react';
import { Navigate } from 'react-router-dom';

// PrivateRoute chroni trasy dostępne tylko dla zalogowanych użytkowników
const PrivateRoute = ({ element: Component }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Sprawdza czy istnieje token w localStorage

  return isAuthenticated ? Component : <Navigate to="/login" />;
};

export default PrivateRoute;
