import React, { useState, useEffect } from 'react';
import { 
  Table, Form, Button, Container, Row, Col, 
  Modal, Badge, InputGroup, Dropdown, Tab, Tabs,
  Alert, Spinner, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileExport, FaFilePdf, FaFileExcel, FaCalendarAlt, FaComments, FaPaperclip } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const Applications = ({ user }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    kontak: '',
    posisi: '',
    status: 'pending',
    documents: [],
    notes: [],
    interviewDate: '',
    appliedDate: new Date().toISOString().split('T')[0]
  });
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    position: '',
    dateRange: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const sampleData = [
          { 
            id: 1,
            nama: 'John Doe', 
            email: 'john@example.com', 
            kontak: '08123456789', 
            posisi: 'Frontend Developer', 
            status: 'lolos',
            documents: ['CV_JohnDoe.pdf', 'Portfolio_JohnDoe.pdf'],
            notes: [
              { text: 'Strong React skills', author: 'HR Team', date: '2023-05-10' },
              { text: 'Passed technical test', author: 'Tech Lead', date: '2023-05-12' }
            ],
            interviewDate: '2023-05-15',
            appliedDate: '2023-05-01'
          }
        ];
        setApplications(sampleData);
        setFilteredApplications(sampleData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, navigate]);

  useEffect(() => {
    let results = applications;
    
    if (activeTab !== 'all') {
      results = results.filter(app => app.status === activeTab);
    }
    
    if (searchTerm) {
      results = results.filter(app => 
        app.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.posisi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.status) {
      results = results.filter(app => app.status === filters.status);
    }
    if (filters.position) {
      results = results.filter(app => app.posisi === filters.position);
    }
    
    setFilteredApplications(results);
  }, [applications, searchTerm, filters, activeTab]);

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      nama: '',
      email: '',
      kontak: '',
      posisi: '',
      status: 'pending',
      documents: [],
      notes: [],
      interviewDate: '',
      appliedDate: new Date().toISOString().split('T')[0]
    });
    setEditIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (editIndex !== null) {
        const updatedApplications = [...applications];
        updatedApplications[editIndex] = formData;
        setApplications(updatedApplications);
      } else {
        const newApp = {
          ...formData,
          id: applications.length + 1,
          documents: [],
          notes: []
        };
        setApplications([...applications, newApp]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleAddNote = (appId) => {
    if (!noteText.trim() || !user) return;
    
    const updatedApps = applications.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          notes: [
            ...app.notes,
            {
              text: noteText,
              author: user.name || 'System',
              date: new Date().toISOString().split('T')[0]
            }
          ]
        };
      }
      return app;
    });
    
    setApplications(updatedApps);
    setNoteText('');
  };

  const handleFileUpload = (e, appId) => {
    const files = e.target.files;
    if (!files.length) return;
    
    const updatedApps = applications.map(app => {
      if (app.id === appId) {
        const newDocs = Array.from(files).map(file => file.name);
        return {
          ...app,
          documents: [...app.documents, ...newDocs]
        };
      }
      return app;
    });
    
    setApplications(updatedApps);
  };

  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(filteredApplications.map(app => ({
        Name: app.nama,
        Email: app.email,
        Contact: app.kontak,
        Position: app.posisi,
        Status: app.status,
        'Applied Date': app.appliedDate,
        'Interview Date': app.interviewDate
      })));
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Applications");
      XLSX.writeFile(wb, "job_applications.xlsx");
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'lolos': return <Badge bg="success">Lolos</Badge>;
      case 'wawancara': return <Badge bg="primary">Wawancara</Badge>;
      case 'test': return <Badge bg="warning" text="dark">Test</Badge>;
      case 'ditolak': return <Badge bg="danger">Ditolak</Badge>;
      default: return <Badge bg="secondary">Pending</Badge>;
    }
  };
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Application Management</h2>
      
      <Row className="mb-4">
        <Col md={8}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="all" title="All" />
            <Tab eventKey="pending" title="Pending" />
            <Tab eventKey="lolos" title="Lolos" />
            <Tab eventKey="wawancara" title="Wawancara" />
            <Tab eventKey="test" title="Test" />
            <Tab eventKey="ditolak" title="Ditolak" />
          </Tabs>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="primary" onClick={() => setShowModal(true)} className="me-2">
            Add New Application
          </Button>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-export">
              <FaFileExport className="me-1" /> Export
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={exportToExcel}><FaFileExcel className="me-2" /> Excel</Dropdown.Item>
              <Dropdown.Item><FaFilePdf className="me-2" /> PDF</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search by name, email or position"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text><FaFilter /></InputGroup.Text>
            <Form.Select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="lolos">Lolos</option>
              <option value="wawancara">Wawancara</option>
              <option value="test">Test</option>
              <option value="ditolak">Ditolak</option>
            </Form.Select>
            <Form.Select
              value={filters.position}
              onChange={(e) => setFilters({...filters, position: e.target.value})}
            >
              <option value="">All Positions</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="UI Designer">UI Designer</option>
              <option value="Product Manager">Product Manager</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>
      
      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Alert variant="info">No applications found matching your criteria</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Interview Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>
                    <Link to={`/application/${app.id}`}>{app.nama}</Link>
                    {app.notes.length > 0 && (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{app.notes.length} notes</Tooltip>}
                      >
                        <FaComments className="ms-2 text-info" />
                      </OverlayTrigger>
                    )}
                    {app.documents.length > 0 && (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{app.documents.length} documents</Tooltip>}
                      >
                        <FaPaperclip className="ms-2 text-secondary" />
                      </OverlayTrigger>
                    )}
                  </td>
                  <td>{app.posisi}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>{app.appliedDate}</td>
                  <td>
                    {app.interviewDate ? (
                      <>
                        <FaCalendarAlt className="me-1" />
                        {app.interviewDate}
                      </>
                    ) : '-'}
                  </td>
                  <td>
                    <Button variant="info" size="sm" onClick={() => {
                      setFormData(app);
                      setEditIndex(applications.findIndex(a => a.id === app.id));
                      setShowModal(true);
                    }} className="me-2">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => {
                      setApplications(applications.filter(a => a.id !== app.id));
                    }}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Application Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? 'Edit Application' : 'Add New Application'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="kontak"
                    value={formData.kontak}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Select
                    name="posisi"
                    value={formData.posisi}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="UI Designer">UI Designer</option>
                    <option value="Product Manager">Product Manager</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="lolos">Lolos</option>
                    <option value="wawancara">Wawancara</option>
                    <option value="test">Test</option>
                    <option value="ditolak">Ditolak</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Interview Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {editIndex !== null && (
              <>
                <hr />
                <h5>Documents</h5>
                {formData.documents.length > 0 ? (
                  <ul>
                    {formData.documents.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No documents uploaded</p>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Upload Documents</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files.length) {
                        const newDocs = Array.from(files).map(file => file.name);
                        setFormData({
                          ...formData,
                          documents: [...formData.documents, ...newDocs]
                        });
                      }
                    }}
                  />
                </Form.Group>
                
                <hr />
                <h5>Notes</h5>
                {formData.notes.length > 0 ? (
                  <div className="notes-container">
                    {formData.notes.map((note, i) => (
                      <div key={i} className="note-item mb-2 p-2 bg-light rounded">
                        <div className="d-flex justify-content-between">
                          <strong>{note.author}</strong>
                          <small>{note.date}</small>
                        </div>
                        <p className="mb-0">{note.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No notes added</p>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Add Note</Form.Label>
                  <InputGroup>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add your notes here..."
                    />
                    <Button 
                      variant="primary"
                      onClick={() => {
                        if (!noteText.trim()) return;
                        setFormData({
                          ...formData,
                          notes: [
                            ...formData.notes,
                            {
                              text: noteText,
                              author: user.name,
                              date: new Date().toISOString().split('T')[0]
                            }
                          ]
                        });
                        setNoteText('');
                      }}
                    >
                      Add
                    </Button>
                  </InputGroup>
                </Form.Group>
              </>
            )}
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Applications;