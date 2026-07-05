import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) return true; 

    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      const user = JSON.parse(localUser);
      if (user.expiry && Date.now() > user.expiry) {
        localStorage.removeItem('currentUser'); 
        return false;
      }
      return true;
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