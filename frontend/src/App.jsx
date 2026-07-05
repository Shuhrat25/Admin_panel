import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Activate from './components/Activate';
import AdminPanel from './components/AdminPanel';

function App() {
  // Теперь это динамическое состояние. По умолчанию false (не авторизован)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Передаем функцию setIsAuthenticated в Login */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:token" element={<Activate />} />

        {/* Защищенный роут */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;