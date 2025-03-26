import React from 'react';
import { Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container>
      <h2 className="mb-4">Dashboard</h2>
      <Card>
        <Card.Body>
          <h4>User Information</h4>
          <Row>
            <Col md={6}>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </Col>
            <Col md={6}>
              <p><strong>Role:</strong> {user.role}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;