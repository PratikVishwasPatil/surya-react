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

        axios.get('http://localhost:5000/get_fields')
            .then((res) => {
                const fetchedCategories = res.data;

                fetchedCategories.sort((a, b) => a.sequence - b.sequence);

                fetchedCategories.forEach(category => {
                    category.fields.forEach(field => {
                        field.field_label = field.field_label || formatFieldName(field.field_name);
                        field.field_type = field.field_type;
                        if (field.options && typeof field.options === 'string' && field.options.trim() !== '') {
                            field.options = field.options.split(',').map(opt => opt.trim());
                        }
                        else {
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
                    category.fields.forEach(field => {
                        defaultForm[field.field_name] = field.field_type === 'checkbox' || field.field_type === 'multiselect'
                            ? []
                            : '';
                    });
                });

                setFormData(defaultForm);
            })
            .catch((err) => {
                console.error("Error fetching fields:", err);
            })
            .finally(() => {
                setLoading(false);
            });

        axios.get('http://localhost:5000/api/countries')
            .then(response => {
                setCountries(response.data);
            })
            .catch(err => {
                console.error("Error fetching countries:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost/surya_apis/api/get_statelist.php`)
            .then(response => {
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

            axios.post(`http://localhost/surya_apis/api/get_citylist.php`, formData)
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
        const submissionData = {
            ...formData,
            form_name: formattedTitle // Add the form title to be stored in the database
        };
        const isValid = await validateWithAI(formData);
        if (isValid) {
            axios.post('http://localhost:5000/submit_form', submissionData)
                .then(res => {
                    toast.success('Form submitted successfully');
                    handleReset(); // Reset form
                })
                .catch(err => {
                    console.error('Error submitting form:', err);
                    toast.success('Error submitting form:', err);
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

    const renderField = (field) => {
        const darkModeClasses = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';
        const hasError = validationErrors[field.field_name];
        const isInvalid = formTouched && hasError;

        const isRequired = ['email'].includes(field.field_name);

        const getFieldFeedback = () =>
            isInvalid && (
                <Form.Control.Feedback type="invalid">
                    {validationErrors[field.field_name]}
                </Form.Control.Feedback>
            );

        const getInvalidFeedbackDiv = () =>
            isInvalid && (
                <div className="invalid-feedback d-block">
                    {validationErrors[field.field_name]}
                </div>
            );
        return (
            <Form.Group className="mb-3 position-relative" key={field.field_name}>
                <Form.Label className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>
                    {field.field_label} {isRequired && <span className="text-danger">*</span>}
                </Form.Label>

                {field.field_type === 'select' && (
                    <>
                        <Form.Select
                            name={field.field_name}
                            value={formData[field.field_name] || ''}
                            onChange={handleChange}
                            required={isRequired}
                            className={`shadow-sm ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                            disabled={field.readonly}
                        >
                            <option value="">Select {field.field_label}</option>
                            {field.options?.map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                            ))}
                        </Form.Select>
                        {getFieldFeedback()}
                    </>
                )}

                {field.field_type === 'multiselect' && (
                    <>
                        <Select
                            isMulti
                            isSearchable
                            name={field.field_name}
                            isDisabled={field.readonly}
                            options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
                            value={(formData[field.field_name] || []).map(val => ({ value: val, label: val }))}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions.map(option => option.value);
                                setFormData(prev => ({
                                    ...prev,
                                    [field.field_name]: values
                                }));

                                setTimeout(() => {
                                    validateWithAI({
                                        ...formData,
                                        [field.field_name]: values
                                    });
                                }, 300);
                            }}
                            className={`react-select-container mb-2 ${isInvalid ? 'is-invalid' : ''}`}
                            classNamePrefix="react-select"
                            placeholder={`Select ${field.field_label}`}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: isInvalid ? '#dc3545' : base.borderColor,
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#495057' : '#dee2e6',
                                }),
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000',
                                }),
                                multiValueRemove: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#adb5bd' : '#495057',
                                    ':hover': {
                                        backgroundColor: '#ff6b6b',
                                        color: 'white',
                                    },
                                }),
                            }}
                        />
                        {getInvalidFeedbackDiv()}
                    </>
                )}

                {field.field_type === 'textarea' && (
                    <>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name={field.field_name}
                            value={formData[field.field_name] || ''}
                            onChange={handleChange}
                            readOnly={field.readonly}
                            required={isRequired}
                            className={`shadow-sm ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                            placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                        />
                        {getFieldFeedback()}
                    </>
                )}

                {field.field_type === 'password' && (
                    <>
                        <div className="position-relative">
                            <Form.Control
                                type={passwordVisibility[field.field_name] ? 'text' : 'password'}
                                name={field.field_name}
                                value={formData[field.field_name] || ''}
                                onChange={handleChange}
                                readOnly={field.readonly}
                                required={isRequired}
                                className={`shadow-sm pe-5 ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                                placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                            />
                            <span
                                onClick={() =>
                                    setPasswordVisibility(prev => ({
                                        ...prev,
                                        [field.field_name]: !prev[field.field_name]
                                    }))
                                }
                                className="position-absolute top-50 end-0 translate-middle-y me-3"
                                style={{ cursor: 'pointer', zIndex: 10 }}
                            >
                                <i className={`bi ${passwordVisibility[field.field_name] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </span>
                        </div>
                        {getFieldFeedback()}
                    </>
                )}

                {field.field_type === 'radio' && (
                    <>
                        <div className="d-flex flex-wrap gap-3 mt-2">
                            {field.options?.map((opt, idx) => (
                                <Form.Check
                                    key={idx}
                                    type="radio"
                                    label={opt}
                                    name={field.field_name}
                                    value={opt}
                                    checked={formData[field.field_name] === opt}
                                    onChange={handleChange}
                                    className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                    id={`${field.field_name}-${idx}`}
                                    required={isRequired}
                                    disabled={field.readonly}
                                    isInvalid={isInvalid}
                                />
                            ))}
                        </div>
                        {getInvalidFeedbackDiv()}
                    </>
                )}

                {field.field_type === 'checkbox' && (
                    <>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {field.options?.map((opt, idx) => (
                                <Form.Check
                                    key={idx}
                                    type="checkbox"
                                    label={opt}
                                    name={field.field_name}
                                    value={opt}
                                    checked={formData[field.field_name]?.includes(opt)}
                                    onChange={handleChange}
                                    className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                    id={`${field.field_name}-${idx}`}
                                    required={isRequired}
                                    disabled={field.readonly}
                                    isInvalid={isInvalid}
                                />
                            ))}
                        </div>
                        {getInvalidFeedbackDiv()}
                    </>
                )}

                {field.field_type === 'file' && (
                    <>
                        <Form.Control
                            type="file"
                            name={field.field_name}
                            onChange={handleChange}
                            className={`shadow-sm ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                            disabled={field.readonly}
                        />
                        {getFieldFeedback()}
                    </>
                )}

                {['select', 'multiselect', 'textarea', 'password', 'radio', 'checkbox', 'file'].indexOf(field.field_type) === -1 && (
                    <>
                        <Form.Control
                            type={field.field_type}
                            name={field.field_name}
                            value={formData[field.field_name] || ''}
                            onChange={handleChange}
                            readOnly={field.readonly}
                            required={isRequired}
                            className={`shadow-sm ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                            placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                        />
                        {getFieldFeedback()}
                    </>
                )}

                {field.help_text && !isInvalid && (
                    <Form.Text className={`mt-1 d-block ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>
                        <small>{field.help_text}</small>
                    </Form.Text>
                )}
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
            boxShadow: theme === 'dark'
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backgroundColor: themeStyles.cardBg,
            margin: '0 auto',
            maxWidth: '1400px',
            border: `1px solid ${themeStyles.borderColor}`,
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
                                                            {category.category_label}
                                                            {category.fields.some(field => validationErrors[field.field_name]) && (
                                                                <span className="ms-2 text-danger">⚠️</span>
                                                            )}
                                                        </div>
                                                    </Accordion.Header>
                                                    <Accordion.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                                                        <Row>
                                                            {category.fields.map((field) => {
                                                                const isFullWidth =
                                                                    field.field_type === 'textarea' ||
                                                                    (field.field_type === 'checkbox' && field.options?.length > 3) ||
                                                                    category.category_key === 'address';

                                                                return (
                                                                    <Col md={isFullWidth ? 12 : 4} key={field.field_name} className="mb-3">
                                                                        {renderField(field)}
                                                                    </Col>
                                                                );
                                                            })}
                                                        </Row>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                        <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                                            <Button
                                                variant={themeStyles.buttonPrimary}
                                                type="submit"
                                                size="sm"
                                                className="px-4 shadow-sm"
                                                disabled={validating}
                                                style={{ fontFamily: "'Maven Pro', sans-serif" }}
                                            >
                                                {validating ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                        Validating...
                                                    </>
                                                ) : "Submit Form"}
                                            </Button>
                                            <Button
                                                variant={themeStyles.buttonSecondary}
                                                type="button"
                                                size="sm"
                                                className="px-4 shadow-sm"
                                                onClick={handleReset}
                                                style={{ fontFamily: "'Maven Pro', sans-serif" }}
                                            >
                                                Reset
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