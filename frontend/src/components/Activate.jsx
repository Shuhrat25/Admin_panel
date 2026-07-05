import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';

function Activate() {
  const { token } = useParams(); 
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activateAccount = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log(`Отправка токена на сервер: ${token}`);
        setStatus('success');
        setMessage('Your account has been successfully verified!');
      } catch (err) {
        console.error('Ошибка активации:', err.message);
        setStatus('error');
        setMessage('Activation link is invalid or has expired.');
      }
    };

    activateAccount();
  }, [token]);

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-sm text-center">
        <Card.Body className="p-4">
          <h2 className="mb-4">Account Activation</h2>

          {status === 'loading' && (
            <div>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p>Verifying your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <Alert variant="success">{message}</Alert>
              <Link to="/login" className="btn btn-primary w-100">Go to Sign In</Link>
            </div>
          )}

          {status === 'error' && (
            <div>
              <Alert variant="danger">{message}</Alert>
              <Link to="/register" className="btn btn-outline-primary w-100 mb-2">Try Registering Again</Link>
              <Link to="/login" className="btn btn-primary w-100">Go to Sign In</Link>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Activate;