import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col, Card, Spinner, Alert, Accordion, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation } from 'react-router-dom';

function DynamicForm() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('light');
    const [validationErrors, setValidationErrors] = useState({});
    const [validating, setValidating] = useState(false);
    const [validationTimeout, setValidationTimeout] = useState(null);
    const [formTouched, setFormTouched] = useState(false);
    const [activeKey, setActiveKey] = useState('0'); // For accordion control
    const [passwordVisibility, setPasswordVisibility] = useState({});
    // const [notifications, setNotifications] = useState(3);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    useEffect(() => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;700&display=swap';
        document.head.appendChild(linkElement);

        document.body.style.fontFamily = "'Maven Pro', sans-serif";

        setLoading(true);

        // const formName = 'employee_form'; // <-- you can make this dynamic later if needed

        // const formName = formattedTitle;
        const formName = formattedTitle;
        const submissionData = {
            form_name: formName
        };
        axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/get_fields.php',submissionData)
            .then((res) => {
                const fetchedCategories = res.data;

                fetchedCategories.sort((a, b) => a.sequence - b.sequence);

                fetchedCategories.forEach(category => {
                    category.fields.forEach(field => {
                        field.field_label = field.field_label || formatFieldName(field.field_name);
                        field.field_type = field.field_type;
                        if (field.options && typeof field.options === 'string' && field.options.trim() !== '') {
                            field.options = field.options.split(',').map(opt => opt.trim());
                        } else {
                            field.options = Array.isArray(field.options) ? field.options : [];
                        }

                        field.help_text = field.help_text || '';
                        field.readonly = field.readonly || false;
                    });
                    category.fields.sort((a, b) => a.field_sequence - b.field_sequence);
                });

                setCategories(fetchedCategories);

                const defaultForm = {};

                    fetchedCategories.forEach(category => {
                    const isMultipleGroup = category.is_multiple === '1' || category.is_multiple === 1;
                   
                    if (isMultipleGroup) {
                        defaultForm[category.category_key] = [
                        Object.fromEntries(category.fields.map(field => [
                            
                            field.field_name,
                            field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : ''
                        ]))
                        ];
                    } else {
                        category.fields.forEach(field => {
                            if (field.is_multiple == 'yes') {
                                defaultForm[field.field_name] = [''];
                            } else if (field.field_type === 'checkbox' || field.field_type === 'multiselect') {
                                defaultForm[field.field_name] = [];
                            } else {
                                defaultForm[field.field_name] = '';
                            }
                        defaultForm[field.field_name] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                        });
                    }
                    });

                    setFormData(defaultForm);
            })
            .catch((err) => {
                console.error("Error fetching fields:", err);
            })
            .finally(() => {
                setLoading(false);
            });

        
    }, []);

    useEffect(() => {
        setLoading(true);
      //  axios.get(`http://localhost/surya_apis/api/get_statelist.php`)
      axios.get(`http://93.127.167.54/Surya_React/surya_dynamic_api/get_statelist.php`)
            .then(response => {
                console.log("response");
                console.log(response);
                setStates(response.data.data); // Access the data array from your JSON structure
            })
            .catch(err => {
                console.error("Error fetching states:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); // Empty dependency array - runs only once on component mount

    useEffect(() => {
        const stateId = formData.state; // or whatever your state field name is

        if (stateId) {
            setLoading(true);

            // Method 1: Using POST with form data
            const formData = new FormData();
            formData.append('state', stateId);
            // axios.post(`http://localhost/surya_apis/api/get_citylist.php`, formData)
            axios.post(`http://93.127.167.54/Surya_React/surya_dynamic_api/get_citylist.php`, formData)
                .then(response => {
                    console.log('Cities API Response:', response.data);

                    if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        setCities(response.data.data);
                        console.log('Cities loaded:', response.data.data.length);
                    } else {
                        console.error('Unexpected cities API response structure:', response.data);
                        setCities([]);
                    }
                })
                .catch(err => {
                    console.error("Error fetching cities:", err);
                    setCities([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setCities([]);
        }
    }, [formData.state]);
    const formatFieldName = (fieldName) => {
        return fieldName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };


    const validateWithAI = async (data) => {
        setValidating(true);
        try {
            const errors = {};

            if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.email = "Please enter a valid email address";
            }

            if (data.name && !/^[a-zA-Z\s'-]+$/.test(data.name)) {
                errors.name = "Name should only contain letters, spaces, hyphens, and apostrophes";
            }

            if (data.phone && !/^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(data.phone)) {
                errors.phone = "Please enter a valid phone number (e.g., 123-456-7890 or (123) 456-7890)";
            }

            if (data.zip_code) {
                if (data.country === 'United States' && !/^\d{5}(-\d{4})?$/.test(data.zip_code)) {
                    errors.zip_code = "US zip codes should be in format 12345 or 12345-6789";
                } else if (data.country === 'Canada' && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(data.zip_code)) {
                    errors.zip_code = "Canadian postal codes should be in format A1A 1A1";
                }
            }

            if (data.country === 'United States' && data.state) {
                errors.state = "Please enter a valid US state name or abbreviation";
            }

            if (data["address 1"] && data["address 1"].length < 5) {
                errors["address 1"] = "Please enter a complete address";
            }

            if (data.password && data.confirm_password) {
                if (data.password.length < 6) {
                    errors.password = "Password must be at least 6 characters long";
                } else if (data.password !== data.confirm_password) {
                    errors.confirm_password = "Passwords do not match";
                }
            }
            const requiredFields = ['email'];

            requiredFields.forEach(fieldName => {
                if (!data[fieldName] || (Array.isArray(data[fieldName]) && data[fieldName].length === 0)) {
                    errors[fieldName] = `${formatFieldName(fieldName)} is required`;
                }
            });
            await new Promise(resolve => setTimeout(resolve, 300));

            setValidationErrors(errors);
            return Object.keys(errors).length === 0;
        } catch (error) {
            console.error("Validation error:", error);
            return false;
        } finally {
            setValidating(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newFormData = { ...formData };

        if (type === 'checkbox') {
            const current = newFormData[name] || [];
            newFormData[name] = checked
                ? [...current, value]
                : current.filter(item => item !== value);
        } else {
            newFormData[name] = value;
        }

        setFormData(newFormData);
        setFormTouched(true);

        // Clear previous timeout
        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }

        // Set new timeout for validation
        const newTimeout = setTimeout(() => {
            validateWithAI(newFormData);
        }, 500);

        setValidationTimeout(newTimeout);
    };

    const handleReset = () => {
        const resetForm = {};
        categories.forEach(category => {
            category.fields.forEach(field => {
                resetForm[field.field_name] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
            });
        });
        setFormData(resetForm);
        setValidationErrors({});
        setFormTouched(false);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormTouched(true);

        const isValid = await validateWithAI(formData);
        if (isValid) {
            // Structure the data in the required format
            const submissionData = {
                type: "insert",
                table: "submitted_forms",
                form_name: formattedTitle, // This will be at the top level
                insert_array: [
                    {
                        form_data: {
                            ...formData,
                            form_name: formattedTitle // Keep this in form_data as well if needed
                        }
                    }
                ]
            };

            axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php', submissionData)
                .then(res => {
                    toast.success('Form submitted successfully');
                    handleReset(); // Reset form
                })
                .catch(err => {
                    console.error('Error submitting form:', err);
                    toast.error('Error submitting form:', err); // Fixed: changed from toast.success to toast.error
                });
        } else {
            const firstErrorField = Object.keys(validationErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    const renderMultiEntryGroup = (category) => {
        const groupEntries = formData[category.category_key] || [];
      
        return (
          <>
            {groupEntries.map((entry, index) => (
              <Card key={`${category.category_key}-${index}`} className="mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      {category.category_label} #{index + 1}
                    </h6>
                    {groupEntries.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          const updatedGroup = groupEntries.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            [category.category_key]: updatedGroup
                          }));
                        }}
                      >
                        <i className="bi bi-dash"></i>
                      </Button>
                    )}
                  </div>
                  <Row>
                    {category.fields.map((field) => {
                      const fullFieldName = `${category.category_key}_${index}_${field.field_name}`;
                      const value = entry[field.field_name];
      
                      return (
                        <Col md={6} key={fullFieldName}>
                          {renderField(field, value, (e) => {
                            const newVal = e.target.value;
                            const updatedGroup = [...formData[category.category_key]];
                            updatedGroup[index][field.field_name] = newVal;
                            setFormData(prev => ({
                              ...prev,
                              [category.category_key]: updatedGroup
                            }));
                          })}
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>
            ))}
      
            <div className="text-end">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  const newGroup = Object.fromEntries(
                    category.fields.map(field => [field.field_name, ''])
                  );
                  setFormData(prev => ({
                    ...prev,
                    [category.category_key]: [...(prev[category.category_key] || []), newGroup]
                  }));
                }}
              >
                <i className="bi bi-plus"></i> Add {category.category_label}
              </Button>
            </div>
          </>
        );
      };
      
      const renderField = (field, value = '', onChange = handleChange) => {
        if (field.is_multiple) {
          const entries = formData[field.field_name] || [''];
          return (
            <>
              <Form.Label className="fw-bold d-block">{field.field_label}</Form.Label>
              {entries.map((val, idx) => (
                <div key={idx} className="d-flex mb-2 align-items-center">
                  <Form.Control
                    type={field.field_type}
                    name={`${field.field_name}_${idx}`}
                    value={val}
                    onChange={(e) => {
                      const updated = [...entries];
                      updated[idx] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        [field.field_name]: updated
                      }));
                    }}
                    className="me-2"
                  />
                  {idx === entries.length - 1 ? (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          [field.field_name]: [...entries, '']
                        }));
                      }}
                    >
                      <i className="bi bi-plus"></i>
                    </Button>
                  ) : (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        const filtered = entries.filter((_, i) => i !== idx);
                        setFormData(prev => ({
                          ...prev,
                          [field.field_name]: filtered
                        }));
                      }}
                    >
                      <i className="bi bi-dash"></i>
                    </Button>
                  )}
                </div>
              ))}
            </>
          );
        }
      
        // fallback (single field)
        return (
          <Form.Group className="mb-3">
            <Form.Label>{field.field_label}</Form.Label>
            <Form.Control
              type={field.field_type}
              name={field.field_name}
              value={value || ''}
              onChange={onChange}
              placeholder={`Enter ${field.field_label}`}
            />
          </Form.Group>
        );
      };
      
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#121212',
                color: '#f8f9fa',
                cardBg: '#212529',
                cardHeader: '#343a40',
                accordionBg: '#1e2125',
                accordionHeader: '#2c3034',
                buttonPrimary: 'outline-info',
                buttonSecondary: 'outline-danger',
                formBg: '#2c3034',
                navBg: '#121212'
            };
        }
        return {
            backgroundColor: '#f0f2f5',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'primary',
            accordionBg: '#ffffff',
            accordionHeader: '#f8f9fa',
            buttonPrimary: 'primary',
            buttonSecondary: 'danger',
            formBg: ''
        };
    };

    const themeStyles = getThemeStyles();
    const formErrors = Object.keys(validationErrors).length;
    const fullScreenStyles = {
        pageContainer: {
            backgroundColor: themeStyles.backgroundColor,
            minHeight: '100vh',
            width: '100%',
            padding: '0',
            margin: '0',
            maxWidth: '100%'
        },
        mainContent: {
            padding: '0rem 0',
        },
        formCard: {
            borderRadius: '12px',
            overflow: 'hidden',
            // add by tejasvi at 29-06-2025
            margin: '0 auto',
            width: '100%',
            padding: '1rem',
            maxWidth: '100%', 
            boxShadow: theme === 'dark'
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backgroundColor: themeStyles.cardBg,
           
          
            // border: `1px solid ${themeStyles.borderColor}`,
        },
        accordionStyles: {
            backgroundColor: themeStyles.accordionBg,
            borderRadius: '8px',
            marginBottom: '0.75rem',
            border: `1px solid ${themeStyles.borderColor}`,
            overflow: 'hidden',
        },
        accordionButton: {
            backgroundColor: themeStyles.accordionHeader,
            color: themeStyles.color,
            fontFamily: "'Maven Pro', sans-serif",
            fontWeight: '600',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            borderRadius: '0',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem',
            minHeight: '45px',
        },
        formHeader: {
            background: theme === 'dark'
                ? 'linear-gradient(135deg,rgb(169, 172, 177) 0%, #161b22 100%)'
                : 'linear-gradient(135deg,rgba(197, 184, 184, 0.51) 0%,rgba(97, 91, 91, 0.56) 100%)',
            color: themeStyles.color,
            padding: '0.5rem 2rem',
            borderBottom: `2px solid ${themeStyles.borderColor}`,
            position: 'relative',
            overflow: 'hidden',
        },
        formHeaderContent: {
            position: 'relative',
            zIndex: 2,
        },
        themeToggle: {
            backgroundColor: 'transparent',
            border: `2px solid ${themeStyles.borderColor}`,
            color: themeStyles.color,
            borderRadius: '25px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.85rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },

    };
    const location = useLocation();
    const path = location.pathname.split('/').pop();
    const formattedTitle = path
        ? path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Dynamic Form';

    const formTitle = formattedTitle;
    return (
        <>
            <ToastContainer />
            <Container fluid style={fullScreenStyles.pageContainer}>
                <div style={fullScreenStyles.mainContent}>
                    <div style={fullScreenStyles.formCard}>
                        <div style={fullScreenStyles.formHeader}>
                            <div style={fullScreenStyles.formHeaderContent} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4
                                        className="mb-1 mb-lg-0"
                                        style={{
                                            fontFamily: "'Maven Pro', sans-serif",
                                            fontWeight: '100',
                                            color: 'black'
                                        }}
                                    >
                                        {formTitle}
                                    </h4>

                                    <p className="mb-0" style={{
                                        fontSize: '0.9rem',
                                        color: themeStyles.textSecondary,
                                        fontWeight: '400'
                                    }}>
                                        Please fill out all required fields
                                    </p>
                                </div>
                                <button
                                    style={fullScreenStyles.themeToggle}
                                    onClick={toggleTheme}
                                    className="btn"
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = theme === 'dark' ? '#30363d' : '#f1f5f9';
                                        e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <span>{theme === 'light' ? '🌙' : '☀️'}</span>
                                    <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                                </button>
                            </div>
                        </div>
                        <Card.Body className={`p-4 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} />
                                    <p className="mt-3" style={{ fontFamily: "'Maven Pro', sans-serif" }}>
                                        Loading and organizing form fields...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className={`mb-4 ${formTouched ? 'd-block' : 'd-none'}`}>
                                        <Alert
                                            variant={formErrors ? (theme === 'dark' ? 'danger' : 'danger') : (theme === 'dark' ? 'info' : 'success')}
                                            className={`d-flex align-items-center ${theme === 'dark' ? 'bg-dark border-info' : ''}`}
                                            style={{ fontFamily: "'Maven Pro', sans-serif" }}
                                        >
                                            <div className="d-flex align-items-center">
                                                {validating ? (
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                ) : formErrors ? (
                                                    <i className="me-2">⚠️</i>
                                                ) : (
                                                    <i className="me-2">✅</i>
                                                )}
                                                <div>
                                                    <strong>
                                                        {validating
                                                            ? "AI is validating your input..."
                                                            : formErrors
                                                                ? `${formErrors} validation ${formErrors === 1 ? 'issue' : 'issues'} detected`
                                                                : "All fields are valid"}
                                                    </strong>
                                                    {formErrors > 0 && (
                                                        <div className="small mt-1">
                                                            Please correct the highlighted fields before submitting.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Alert>
                                    </div>
                                    <Form onSubmit={handleSubmit} noValidate>
                                        <input type="hidden" name="form_name" value={formTitle} />
                                        <Accordion defaultActiveKey="0" activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
                                            {categories.map((category, index) => (
                                                <Accordion.Item
                                                    eventKey={index.toString()}
                                                    key={category.category_key}
                                                    style={fullScreenStyles.accordionStyles}
                                                >
                                                    <Accordion.Header>
                                                        <div style={{ fontFamily: "'Maven Pro', sans-serif", fontWeight: 'bold' }}>
                                                        <i className={category.badge }></i> {category.category_label}
                                                            {category.fields.some(field => validationErrors[field.field_name]) && (
                                                                <span className="ms-2 text-danger">⚠️</span>
                                                            )}
                                                          <i class="bi bi-plus"></i>
                                                        </div>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
  {category.is_multiple === '1' ? (
    <>
      {renderMultiEntryGroup(category)}
      <Button
        variant="success"
        size="sm"
        onClick={() => {
          const newGroup = Object.fromEntries(category.fields.map(field => [field.field_name, '']));
          setFormData(prev => ({
            ...prev,
            [category.category_key]: [...(prev[category.category_key] || []), newGroup]
          }));
        }}
      >
        <i className="bi bi-plus"></i> Add {category.category_label}
      </Button>
    </>
  ) : (
    <Row>
      {category.fields.map((field) => (
        <Col md={6} key={field.field_name}>{renderField(field)}</Col>
      ))}
    </Row>
  )}
</Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                        <div className="d-flex justify-content-center flex-wrap gap-3 mt-4 pt-4 border-top">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            size="md"
                                            className="px-4 py-2 rounded-pill shadow-sm btn-modern"
                                            disabled={validating}
                                        >
                                            {validating ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Validating...
                                            </>
                                            ) : (
                                            <>
                                                <i className="bi bi-send me-2"></i> Submit Form
                                            </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            type="button"
                                            size="md"
                                            className="px-4 py-2 rounded-pill shadow-sm btn-modern"
                                            onClick={handleReset}
                                        >
                                            <i className="bi bi-x-circle me-2"></i> Reset
                                        </Button>
                                        </div>
                                    </Form>
                                </>
                            )}
                        </Card.Body>
                    </div>
                </div>
            </Container>
        </>
    );
}
export default DynamicForm;