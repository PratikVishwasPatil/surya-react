import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Dashboard() {
  // Mock data for dashboard stats and recent forms
  const stats = [
    { id: 1, title: 'Total Forms', value: '24', icon: 'bi-file-earmark-text', color: 'primary' },
    { id: 2, title: 'Form Submissions', value: '142', icon: 'bi-inbox', color: 'success' },
    { id: 3, title: 'Completion Rate', value: '87%', icon: 'bi-check-circle', color: 'info' },
    { id: 4, title: 'Active Users', value: '56', icon: 'bi-people', color: 'warning' }
  ];

  const recentForms = [
    { id: 1, title: 'Customer Survey', lastEdited: '2 hours ago', responses: 18 },
    { id: 2, title: 'Employee Feedback', lastEdited: '1 day ago', responses: 34 },
    { id: 3, title: 'Event Registration', lastEdited: '3 days ago', responses: 89 }
  ];

  return (
    <Container fluid className="py-4 px-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">Dashboard</h2>
          <p className="text-muted">Welcome to DynamicForm AI dashboard. Manage your forms and view analytics.</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/forms/dynamic" variant="primary">
            <i className="bi bi-plus-circle me-2"></i>Create Form
          </Button>
        </Col>
      </Row>

      {/* Stats Row */}
      <Row className="mb-4 g-3">
        {stats.map(stat => (
          <Col key={stat.id} md={6} lg={3}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className={`text-${stat.color} fs-1 me-3`}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">{stat.title}</h6>
                  <h3 className="mb-0">{stat.value}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Forms */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">Recent Forms</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Form Title</th>
                      <th>Last Edited</th>
                      <th>Responses</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentForms.map(form => (
                      <tr key={form.id}>
                        <td>{form.title}</td>
                        <td>{form.lastEdited}</td>
                        <td>{form.responses}</td>
                        <td>
                          <Button variant="outline-secondary" size="sm" className="me-2">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="outline-primary" size="sm">
                            <i className="bi bi-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
            <Card.Footer className="bg-transparent text-end">
              <Button variant="link" className="text-decoration-none">View All Forms</Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/forms/dynamic" variant="outline-primary" className="text-start">
                  <i className="bi bi-file-earmark-plus me-2"></i>Create Dynamic Form
                </Button>
                <Button variant="outline-secondary" className="text-start">
                  <i className="bi bi-upload me-2"></i>Import Template
                </Button>
                <Button variant="outline-info" className="text-start">
                  <i className="bi bi-graph-up me-2"></i>View Analytics
                </Button>
                <Button variant="outline-success" className="text-start">
                  <i className="bi bi-people me-2"></i>Manage Users
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;