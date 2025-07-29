import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col, Card, Spinner, Alert, Accordion, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
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
    const [notifications, setNotifications] = useState(3);

    useEffect(() => {
        // Add Maven Pro font
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;700&display=swap';
        document.head.appendChild(linkElement);

        document.body.style.fontFamily = "'Maven Pro', sans-serif";

        setLoading(true);

        axios.get('http://localhost:5000/get_fields')
            .then((res) => {
                const fetchedCategories = res.data;

                // Sort categories by sequence
                fetchedCategories.sort((a, b) => a.sequence - b.sequence);

                // Process each field to add missing properties and parse options
                fetchedCategories.forEach(category => {
                    category.fields.forEach(field => {
                        // Add default field properties if not present in API response
                        field.field_label = field.field_label || formatFieldName(field.field_name);
                        field.field_type = field.field_type;
                        // field.field_type = field.field_type || determineFieldType(field.field_name);


                        // Parse options string into array if it exists and is a non-empty string
                        if (field.options && typeof field.options === 'string' && field.options.trim() !== '') {
                            field.options = field.options.split(',').map(opt => opt.trim());
                        } else if (!field.options || field.options === '') {
                            // Fallback to default options only if no options provided
                            field.options = getDefaultOptions(field.field_name);
                        } else {
                            // Ensure options is always an array
                            field.options = Array.isArray(field.options) ? field.options : [];
                        }

                        field.help_text = field.help_text || '';
                        field.readonly = field.readonly || false;
                    });

                    // Sort fields by sequence
                    category.fields.sort((a, b) => a.field_sequence - b.field_sequence);
                });

                setCategories(fetchedCategories);

                // Initialize form data for all fields
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
                // Optional fallback
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Helper function to format field name as label
    const formatFieldName = (fieldName) => {
        return fieldName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    // Helper function to determine field type based on field name
    // const determineFieldType = (fieldName) => {
    //     const name = fieldName.toLowerCase();

    //     if (name.includes('email')) return 'email';
    //     if (name.includes('password')) return 'password';
    //     if (name.includes('phone')) return 'tel';
    //     if (name.includes('country')) return 'select';
    //     if (name.includes('state')) return 'select';
    //     if (name.includes('city')) return 'select';
    //     if (name.includes('skills')) return 'multiselect';
    //     if (name.includes('hobbies')) return 'multiselect';
    //     if (name.includes('upload') || name.includes('file')) return 'file';
    //     if (name.includes('address')) return 'textarea';

    //     return 'text';
    // };

    // Helper function to provide default options for select fields
    const getDefaultOptions = (fieldName) => {
        const name = fieldName.toLowerCase();

        if (name.includes('country')) {
            return ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'China', 'India'];
        }

        if (name.includes('state')) {
            return ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
        }

        if (name.includes('hobbies')) {
            return ['Reading', 'Sports', 'Music', 'Traveling', 'Cooking', 'Gaming', 'Photography', 'Art', 'Gardening', 'Hiking'];
        }

        return [];
    };

    // AI validation function
    const validateWithAI = async (data) => {
        setValidating(true);
        try {
            // This would be a real AI validation endpoint
            // For demonstration, we'll simulate AI validation with rules
            const errors = {};

            // Email validation with proper format checking
            if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.email = "Please enter a valid email address";
            }

            // Name validation: must not contain numbers or special characters
            if (data.name && !/^[a-zA-Z\s'-]+$/.test(data.name)) {
                errors.name = "Name should only contain letters, spaces, hyphens, and apostrophes";
            }

            // Phone validation for common formats
            if (data.phone && !/^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(data.phone)) {
                errors.phone = "Please enter a valid phone number (e.g., 123-456-7890 or (123) 456-7890)";
            }

            // Zip code validation for US format
            if (data.zip_code) {
                if (data.country === 'United States' && !/^\d{5}(-\d{4})?$/.test(data.zip_code)) {
                    errors.zip_code = "US zip codes should be in format 12345 or 12345-6789";
                } else if (data.country === 'Canada' && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(data.zip_code)) {
                    errors.zip_code = "Canadian postal codes should be in format A1A 1A1";
                }
            }

            // Smart cross-field validation
            if (data.country === 'United States' && data.state && !isValidUsState(data.state)) {
                errors.state = "Please enter a valid US state name or abbreviation";
            }

            // Address intelligence
            if (data["address 1"] && data["address 1"].length < 5) {
                errors["address 1"] = "Please enter a complete address";
            }

            // Form completeness check
            // Find required fields from all categories
            const requiredFields = ['email', 'name', 'country'];

            requiredFields.forEach(fieldName => {
                if (!data[fieldName] || (Array.isArray(data[fieldName]) && data[fieldName].length === 0)) {
                    errors[fieldName] = `${formatFieldName(fieldName)} is required`;
                }
            });

            // Simulate API call delay
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

    // Helper function to check if a state is valid
    const isValidUsState = (state) => {
        const statesList = [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
            "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
            "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
            "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
            "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
            "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
            "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
        ];

        const stateAbbreviations = [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
            "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
            "VA", "WA", "WV", "WI", "WY"
        ];

        return statesList.some(s => s.toLowerCase() === state.toLowerCase()) ||
            stateAbbreviations.some(s => s.toLowerCase() === state.toLowerCase());
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

        // const location = useLocation();
        // const path = location.pathname.split('/').pop();
        // const formattedTitle = path
        //     .replace(/-/g, ' ')
        //     .replace(/\b\w/g, l => l.toUpperCase());

        // Create a new object that includes all form data plus the form title
        const submissionData = {
            ...formData,
            form_name: formattedTitle // Add the form title to be stored in the database
        };

        // Validate before submitting
        const isValid = await validateWithAI(formData);

        if (isValid) {
            axios.post('http://localhost:5000/submit_form', submissionData)
                .then(res => {
                    alert(res.data.message || "Form submitted successfully!");
                    handleReset(); // Reset form
                })
                .catch(err => {
                    console.error('Error submitting form:', err);
                    alert('Something went wrong while submitting the form.');
                });
        } else {
            // Scroll to first error
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

        const isRequired = ['name', 'email', 'country'].includes(field.field_name);

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

                                // Trigger validation after state update
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

    // Custom styles for full screen design while keeping the card look
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
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            backgroundColor: themeStyles.cardBg,
            margin: '0 auto',
            maxWidth: '1400px', // Maximum width for large screens
        },
        accordionStyles: {
            backgroundColor: themeStyles.accordionBg,
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: theme === 'dark' ? '1px solid #2c3034' : '1px solid #dee2e6',
        },
        accordionButton: {
            backgroundColor: themeStyles.accordionHeader,
            color: theme === 'dark' ? '#f8f9fa' : '#212529',
            fontFamily: "'Maven Pro', sans-serif",
            fontWeight: 'bold',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            borderRadius: '0.5rem',
            transition: 'all 0.2s'
        },

        navbarStyle: {
            backgroundColor: theme === 'dark' ? themeStyles.navBg : '',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontFamily: "'Maven Pro', sans-serif",
            borderBottom: theme === 'dark' ? '1px solid #2c3034' : '1px solid #dee2e6',
            marginBottom: '1rem'
        }
    };

    const location = useLocation();

    // Format title from route
    const path = location.pathname.split('/').pop();
    const formattedTitle = path
        ? path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Dynamic Form';

    const formTitle = formattedTitle;

    return (
        <Container fluid style={fullScreenStyles.pageContainer}>
            <div style={fullScreenStyles.mainContent}>
                <div style={fullScreenStyles.formCard}>
                    <Card.Header
                        className={`bg-${themeStyles.cardHeader} ${theme === 'dark' ? 'text-light' : 'text-white'} py-3`}
                        style={{ fontFamily: "'Maven Pro', sans-serif" }}
                    >
                        <div className="d-flex justify-content-between align-items-center mx-4">
                            <h3 className="mb-0">{formTitle}</h3>
                            <Button
                                variant={theme === 'light' ? 'outline-light' : 'outline-info'}
                                size="sm"
                                onClick={toggleTheme}
                            >
                                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                            </Button>
                        </div>
                    </Card.Header>


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
                                {/* AI Form Status Dashboard */}
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

                                    {/* Accordion for collapsible sections */}
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
                                                            // Determine how many columns this field should take
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
                                            size="lg"
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
                                            size="lg"
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

                    <Card.Footer className={`text-center py-3 ${theme === 'dark' ? 'bg-dark text-light opacity-75' : 'text-muted'}`}
                        style={{ fontFamily: "'Maven Pro', sans-serif" }}>
                        <small>Smart Dynamic Form • AI-Powered Validation • Fields organized logically</small>
                    </Card.Footer>
                </div>
            </div>
        </Container>
    );
}

export default DynamicForm;