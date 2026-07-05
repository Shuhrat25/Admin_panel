import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Table, Button, Form, Badge, 
  Navbar, Nav, OverlayTrigger, Tooltip, Card,
  InputGroup, Pagination
} from 'react-bootstrap';

function AdminPanel({ setIsAuthenticated }) {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'lastLogin', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();
  
  // Достаем данные юзера из того хранилища, где они есть
  const currentUserString = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
  const currentUser = JSON.parse(currentUserString || '{}');

  // Обернули в useCallback
  const handleAuthError = useCallback(() => {
    // Очищаем оба хранилища при выходе или блокировке
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate, setIsAuthenticated]);

  // Обернули в useCallback, чтобы избежать ошибки ESLint (Cascading renders)
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        headers: { 'x-user-id': currentUser.id }
      });
      
      if (response.status === 401 || response.status === 403) return handleAuthError();
      
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          status: u.status,
          lastLogin: u.last_login
        }));
        setUsers(mappedData);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  }, [currentUser.id, handleAuthError]);

  useEffect(() => {
    // Оборачиваем вызов в асинхронную функцию, чтобы линтер не ругался
    const loadData = async () => {
      await fetchUsers();
    };
    
    loadData();
  }, [fetchUsers]);

  const handleAction = async (action) => {
    const endpoint = action === 'delete' ? 'delete' : action;
    const method = action === 'delete' ? 'DELETE' : 'PUT';

    try {
      const response = await fetch(`http://localhost:3000/api/users/${endpoint}`, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ userIds: selectedIds })
      });

      if (response.status === 401 || response.status === 403) return handleAuthError();
      
      if (response.ok) {
        setSelectedIds([]); 
        fetchUsers(); 
      }
    } catch (error) {
      console.error(`Ошибка при выполнении ${action}:`, error);
    }
  };

  const handleBlock = () => handleAction('block');
  const handleUnblock = () => handleAction('unblock');
  const handleDelete = () => handleAction('delete');

  const processedUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) || 
        user.email.toLowerCase().includes(lowerQuery)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = String(a[sortConfig.key] || '');
        const valB = String(b[sortConfig.key] || '');
        
        const compareResult = valA.localeCompare(valB, undefined, { numeric: true });
        return sortConfig.direction === 'asc' ? compareResult : -compareResult;
      });
    }

    return result;
  }, [users, searchQuery, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
  const paginatedUsers = processedUsers.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(paginatedUsers.map(user => user.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'danger';
      case 'unverified': return 'warning';
      default: return 'secondary';
    }
  };

  const isActionDisabled = selectedIds.length === 0;
  const renderTooltip = (text) => <Tooltip>{text}</Tooltip>;

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <i className="bi bi-arrow-down-up text-muted ms-1" style={{fontSize: '0.8rem'}}></i>;
    return sortConfig.direction === 'asc' 
      ? <i className="bi bi-arrow-up text-primary ms-1"></i> 
      : <i className="bi bi-arrow-down text-primary ms-1"></i>;
  };

  return (
    <div className={`min-vh-100 pb-5 ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`} style={{ transition: 'background-color 0.3s' }}>
      
      <Navbar bg={isDarkMode ? 'dark' : 'white'} variant={isDarkMode ? 'dark' : 'light'} className="shadow-sm mb-4 px-4 border-bottom">
        <Container fluid>
          <Navbar.Brand className="fw-bold">
            <i className="bi bi-shield-lock-fill text-primary me-2"></i>
            Admin Workspace
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Form.Check 
              type="switch"
              id="theme-switch"
              label={isDarkMode ? <i className="bi bi-moon-stars-fill text-warning"></i> : <i className="bi bi-sun-fill text-warning"></i>}
              className="me-4 mb-0"
              onChange={() => setIsDarkMode(!isDarkMode)}
              checked={isDarkMode}
            />
            <span className="me-3 text-muted fw-semibold">{currentUser.name}</span>
            {/* Кнопка Logout теперь 100% рабочая */}
            <Button variant={isDarkMode ? 'outline-light' : 'outline-dark'} size="sm" onClick={handleAuthError}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-dark border border-secondary' : ''}`}>
          <Card.Body className="p-0">
            
            <div className={`row g-3 align-items-center p-3 border-bottom m-0 ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
              <div className="col-12 col-md-auto d-flex gap-2 p-0">
                <OverlayTrigger placement="top" overlay={renderTooltip('Block selected users')}>
                  <Button variant="warning" size="sm" onClick={handleBlock} disabled={isActionDisabled} className="d-flex align-items-center fw-semibold shadow-sm">
                    <i className="bi bi-lock-fill me-1"></i> Block
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger placement="top" overlay={renderTooltip('Unblock selected users')}>
                  <Button variant="success" size="sm" onClick={handleUnblock} disabled={isActionDisabled} className="shadow-sm">
                    <i className="bi bi-unlock-fill"></i>
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger placement="top" overlay={renderTooltip('Delete selected users')}>
                  <Button variant="danger" size="sm" onClick={handleDelete} disabled={isActionDisabled} className="shadow-sm">
                    <i className="bi bi-trash3-fill"></i>
                  </Button>
                </OverlayTrigger>
              </div>

              <div className="col-12 col-md d-flex justify-content-md-center p-0 px-md-3">
                <InputGroup size="sm" style={{ maxWidth: '400px', width: '100%' }}>
                  <InputGroup.Text className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className={isDarkMode ? 'bg-dark text-light border-secondary' : ''}
                  />
                </InputGroup>
              </div>

              <div className="col-12 col-md-auto d-flex justify-content-md-end align-items-center p-0 gap-2">
                <span className="text-muted small mb-0">Show:</span>
                <Form.Select 
                  size="sm" 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className={isDarkMode ? 'bg-dark text-light border-secondary' : ''}
                  style={{ width: '80px' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Form.Select>
              </div>
            </div>

            <Table hover responsive className={`mb-0 ${isDarkMode ? 'table-dark' : ''}`} style={{ fontSize: '0.95rem' }}>
              <thead className={isDarkMode ? '' : 'table-light'}>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <Form.Check 
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length > 0 && selectedIds.length === paginatedUsers.length}
                      ref={input => {
                        if (input) input.indeterminate = selectedIds.length > 0 && selectedIds.length < paginatedUsers.length;
                      }}
                    />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('name')}>
                    Name {renderSortIcon('name')}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('email')}>
                    E-mail {renderSortIcon('email')}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('lastLogin')}>
                    Last Login {renderSortIcon('lastLogin')}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>
                    Status {renderSortIcon('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <Form.Check 
                        type="checkbox"
                        onChange={() => handleSelectOne(user.id)}
                        checked={selectedIds.includes(user.id)}
                      />
                    </td>
                    <td className="align-middle fw-medium">{user.name}</td>
                    <td className="align-middle text-muted">{user.email}</td>
                    <td className="align-middle text-muted">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('ru-RU') : 'Never'}
                    </td>
                    <td className="align-middle">
                      <Badge bg={getStatusBadgeVariant(user.status)} className="px-2 py-1 rounded-pill">
                        {user.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-5">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      No records found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            
            {totalPages > 1 && (
              <div className={`d-flex justify-content-between align-items-center p-3 border-top ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                <span className="text-muted small">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedUsers.length)} of {processedUsers.length} entries
                </span>
                <Pagination size="sm" className="mb-0">
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default AdminPanel;