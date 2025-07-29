import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [financialYear, setFinancialYear] = useState('');
  const [financialYears, setFinancialYears] = useState([]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFinancialYears = async () => {
      try {
        const response = await axios.get('http://localhost/surya_apis/get_financial_year.php');
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          setFinancialYears(response.data.data);
        } else {
          console.error('Invalid API response format:', response.data);
          toast.error('Failed to load financial years. Please refresh the page.');
        }
      } catch (error) {
        console.error('Error fetching financial years:', error);
        toast.error('Failed to load financial years. Please check your connection.');
      }
    };
    fetchFinancialYears();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the selected financial year ID from localStorage
      const storedFinancialYearId = localStorage.getItem('selectedFinancialYearId');
      
      // Find the selected financial year object to get its ID
      const selectedFinancialYearObj = financialYears.find(
        year => year.financial_year === financialYear
      );

      // Prepare the data to send to the backend
      const loginData = {
        mobile_number: mobile,
        password: password,
        financial_year_id: selectedFinancialYearObj ? selectedFinancialYearObj.id : storedFinancialYearId,
        financial_year: financialYear
      };

      // Make the API call
      const response = await axios.post('http://localhost/surya_apis/login.php', loginData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Handle successful response
      if (response.data.status === 'success') {
        // Store user data and tokens in localStorage
        localStorage.setItem('userToken', response.data.token || '');
        sessionStorage.setItem('userId', response.data.user_id || '');
        localStorage.setItem('userMobile', mobile);
        localStorage.setItem('selectedFinancialYear', financialYear);
        localStorage.setItem('selectedFinancialYearId', loginData.financial_year_id);
        
        // Store any additional user data returned from the API
        if (response.data.user_data) {
          localStorage.setItem('userData', JSON.stringify(response.data.user_data));
        }

        // Show success message
        toast.success(response.data.message || 'Login successful!');

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        
      } else {
        // Handle error response
        toast.error(response.data.message || 'Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Invalid credentials. Please try again.';
        toast.error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle financial year selection and store in localStorage
  const handleFinancialYearChange = (e) => {
    const selectedYear = e.target.value;
    setFinancialYear(selectedYear);
    
    // Find the selected financial year object to get its ID
    const selectedYearObj = financialYears.find(year => year.financial_year === selectedYear);
    if (selectedYearObj) {
      localStorage.setItem('selectedFinancialYearId', selectedYearObj.id);
      localStorage.setItem('selectedFinancialYear', selectedYear);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Row className="w-100">
        <Col md={{ span: 4, offset: 4 }}>
          <Card className="shadow-sm">
            <Card.Header className="text-center bg-white">
              <h4 className="mb-0">Login</h4>
              <small className="text-muted">Access your dashboard</small>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Financial Year Dropdown */}
                <Form.Group controlId="financialYear" className="mb-3">
                  <Form.Label>Financial Year</Form.Label>
                  <Form.Select
                    value={financialYear}
                    onChange={handleFinancialYearChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Financial Year</option>
                    {financialYears.map((year) => (
                      <option key={year.id} value={year.financial_year}>
                        {year.financial_year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Mobile Number */}
                <Form.Group controlId="mobile" className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    disabled={loading}
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                  />
                </Form.Group>

                {/* Password */}
                <Form.Group controlId="password" className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      style={{
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        padding: '0',
                        color: '#6c757d',
                        textDecoration: 'none'
                      }}
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </Form.Group>

                {/* Submit */}
                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center bg-white">
              <small className="text-muted">© 2025 DynamicForm AI</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Container>
  );
}

export default Login;