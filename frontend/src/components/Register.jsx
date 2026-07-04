import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }
    
    console.log('Попытка регистрации:', { name, email, password });
    setError('');
    setSuccess(true);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Sign Up</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {success && (
             <Alert variant="success">
               Registration successful! Please check your e-mail to verify your account.
             </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="regName">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="regEmail">
              <Form.Label>E-mail</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="test@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="regPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={success}>
              Sign Up
            </Button>
          </Form>

          <div className="text-center mt-3">
            Already have an account? <Link to="/login" className="text-decoration-none">Sign In</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;