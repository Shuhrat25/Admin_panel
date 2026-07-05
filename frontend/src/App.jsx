import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';

function App() {
  // Проверяем хранилище ПРИ ЗАГРУЗКЕ приложения
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) return true; // Если есть сессия (до закрытия вкладки)

    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      const user = JSON.parse(localUser);
      // Проверяем, не истекло ли время (3 часа)
      if (user.expiry && Date.now() > user.expiry) {
        localStorage.removeItem('currentUser'); // Время вышло, удаляем
        return false;
      }
      return true; // Время еще есть, пускаем
    }
    
    return false;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <AdminPanel setIsAuthenticated={setIsAuthenticated} />
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