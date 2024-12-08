import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login'; // Komponent strony logowania
import Register from './pages/Register/Register'; // Komponent strony rejestracji
import Workspace from './pages/Workspace/Workspace'; // Komponent obszaru roboczego aplikacji
import PrivateRoute from './routing/PrivateRoute'; // Komponent odpowiedzialny za ochronę tras
import { AudioProvider } from './components/AudioManager/AudioManager'; // Kontekst dla zarządzania dźwiękiem w aplikacji DJ-skiej

// Konfiguracja domyślna Axios (API)
axios.defaults.baseURL = 'http://localhost:5000/'; // Ustawienie domyślnej bazy URL API
axios.defaults.headers.common['Accept'] = 'application/json'; // Nagłówek określający format odpowiedzi
axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8'; // Nagłówek określający format danych

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Publiczne trasy - dostępne dla wszystkich użytkowników */}
        <Route path="/register" element={<Register />} /> {/* Rejestracja użytkownika */}
        <Route path="/login" element={<Login />} /> {/* Logowanie użytkownika */}

        {/* Chroniona trasa - dostępna tylko dla zalogowanych użytkowników */}
        <Route
          path="/workspace"
          element={
            <PrivateRoute
              element={
                <AudioProvider> {/* Udostępnienie kontekstu AudioManager w obrębie obszaru roboczego */}
                  <Workspace /> {/* Główny interfejs aplikacji DJ-skiej */}
                </AudioProvider>
              }
            />
          }
        />

        {/* Przekierowanie dla nieprawidłowych tras - domyślnie na stronę logowania */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
