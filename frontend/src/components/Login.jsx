import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

// Принимаем пропс setIsAuthenticated
function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // Хук для перенаправления

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }
    
    console.log('Попытка входа:', { email, password });
    setError('');
    
    // Меняем статус авторизации на true
    setIsAuthenticated(true);
    
    // Перенаправляем пользователя на главную страницу (в Admin Panel)
    navigate('/');
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Sign In to The App</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>E-mail</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="test@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="loginRemember">
              <Form.Check type="checkbox" label="Remember me" />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              Sign In
            </Button>
          </Form>

          <div className="text-center mt-3">
            Don't have an account? <Link to="/register" className="text-decoration-none">Sign Up</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;