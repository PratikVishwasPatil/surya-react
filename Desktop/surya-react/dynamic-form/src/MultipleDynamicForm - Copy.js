import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col, Card, Spinner, Alert, Accordion, Badge } from 'react-bootstrap';
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
    const [activeKey, setActiveKey] = useState('0');
    const [passwordVisibility, setPasswordVisibility] = useState({});
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // New state for managing multiple entries per category
    const [categoryEntries, setCategoryEntries] = useState({});
    // Load states
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

        // axios.get('http://localhost:5000/api/countries')
        //     .then(response => {
        //         setCountries(response.data);
        //     })
        //     .catch(err => {
        //         console.error("Error fetching countries:", err);
        //     })
        //     .finally(() => {
        //         setLoading(false);
        //     });
    }, []);

    useEffect(() => {
        axios.post(`http://93.127.167.54/Surya_React/surya_dynamic_api/get_statelist.php`)
            .then(response => {
                setStates(response.data.data);
            })
            .catch(err => {
                console.error("Error fetching states:", err);
            });
    }, []);

    // Load cities based on state selection
    useEffect(() => {
        // Find any state field that has a value
        const stateFields = Object.keys(formData).filter(key => key.startsWith('state_'));
        const stateField = stateFields.find(field => formData[field]);

        if (stateField && formData[stateField]) {
            const formDataObj = new FormData();
            formDataObj.append('state', formData[stateField]);

            axios.post(`http://localhost/surya_apis/api/get_citylist.php`, formDataObj)
                .then(response => {
                    if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        setCities(response.data.data);
                    } else {
                        setCities([]);
                    }
                })
                .catch(err => {
                    console.error("Error fetching cities:", err);
                    setCities([]);
                });
        } else {
            setCities([]);
        }
    }, [formData]);

    const formatFieldName = (fieldName) => {
        return fieldName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Add new entry for a category (only if is_multiple is "yes")
    const addCategoryEntry = (categoryKey) => {
        const category = categories.find(cat => cat.category_key === categoryKey);
        if (!category || category.is_multiple !== 'yes') {
            return; // Don't allow adding if not multiple
        }

        setCategoryEntries(prev => {
            const currentEntries = prev[categoryKey] || [0];
            const newIndex = Math.max(...currentEntries) + 1;
            const newEntries = [...currentEntries, newIndex];

            // Initialize form data for new entry
            if (category.fields && Array.isArray(category.fields)) {
                setFormData(prevFormData => {
                    const newFormData = { ...prevFormData };
                    category.fields.forEach(field => {
                        newFormData[`${field.field_name}_${newIndex}`] = field.field_type === 'checkbox' || field.field_type === 'multiselect'
                            ? []
                            : '';
                    });
                    return newFormData;
                });
            }

            return {
                ...prev,
                [categoryKey]: newEntries
            };
        });
    };

    // Remove entry for a category (only if is_multiple is "yes")
    const removeCategoryEntry = (categoryKey, entryIndex) => {
        const category = categories.find(cat => cat.category_key === categoryKey);
        if (!category || category.is_multiple !== 'yes') {
            return; // Don't allow removing if not multiple
        }

        setCategoryEntries(prev => {
            const currentEntries = prev[categoryKey] || [0];
            if (currentEntries.length <= 1) return prev; // Don't allow removing the last entry

            const newEntries = currentEntries.filter(index => index !== entryIndex);

            // Remove form data for this entry
            if (category.fields && Array.isArray(category.fields)) {
                setFormData(prevFormData => {
                    const newFormData = { ...prevFormData };
                    category.fields.forEach(field => {
                        delete newFormData[`${field.field_name}_${entryIndex}`];
                    });
                    return newFormData;
                });
            }

            return {
                ...prev,
                [categoryKey]: newEntries
            };
        });
    };

    const validateWithAI = async (data) => {
        setValidating(true);
        try {
            const errors = {};

            // Validate all email fields
            Object.keys(data).forEach(key => {
                if (key.includes('email') && data[key]) {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[key])) {
                        errors[key] = "Please enter a valid email address";
                    }
                }

                if (key.includes('name') && data[key]) {
                    if (!/^[a-zA-Z\s'-]+$/.test(data[key])) {
                        errors[key] = "Name should only contain letters, spaces, hyphens, and apostrophes";
                    }
                }

                if (key.includes('phone') && data[key]) {
                    if (!/^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(data[key])) {
                        errors[key] = "Please enter a valid phone number";
                    }
                }
            });

            // Check required fields (at least one email should be filled)
            const emailFields = Object.keys(data).filter(key => key.includes('email'));
            const hasValidEmail = emailFields.some(key => data[key] && data[key].trim() !== '');

            if (!hasValidEmail && emailFields.length > 0) {
                // Mark the first email field as required
                const firstEmailField = emailFields[0];
                if (firstEmailField) {
                    errors[firstEmailField] = "At least one email address is required";
                }
            }

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
        const resetEntries = {};

        categories.forEach(category => {
            resetEntries[category.category_key] = [0]; // Reset to single entry
            if (category.fields && Array.isArray(category.fields)) {
                category.fields.forEach(field => {
                    resetForm[`${field.field_name}_0`] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                });
            }
        });

        setFormData(resetForm);
        setCategoryEntries(resetEntries);
        setValidationErrors({});
        setFormTouched(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormTouched(true);

        const isValid = await validateWithAI(formData);

        if (isValid) {
          const { billingaddress, shippingaddress, ...rest } = formData;
         const billing_add = formData.billingaddress;
         const shipping_add = formData.shippingaddress;
            // Prepare the submission data
            const submissionData = {
                type: "insert",
                table: "submitted_forms",
                form_name: formattedTitle,
                insert_array: [
                  {
                      form_data: {
                          ...rest,
                          form_name: formattedTitle // Keep this in form_data as well if needed
                      }
                  }
              ]
               
            };
           
            axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php', submissionData)
                .then(res => {
                  let insert_id = res.data.insert_id;

                  const submissionData1 = {
                    type: "insert_multiple",
                    table: "submitted_forms",
                    form_name: formattedTitle,
                    insert_array: [
                      {
                          form_data: {
                              ...rest,
                              form_name: shipping_add
                             // Keep this in form_data as well if needed
                          },
                          ref_id:insert_id 
                      }
                  ]
                  
                  };
                  
                  axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php', submissionData1)
                      .then(res1 => {
                        
                   const submissionData1 = {
                    type: "insert_multiple",
                    table: "submitted_forms",
                    form_name: formattedTitle,
                    insert_array: [
                      {
                          form_data: {
                              ...rest,
                              form_name: billing_add
                             // Keep this in form_data as well if needed
                          },
                          ref_id:insert_id 
                      }
                  ]
                  
                  };
                  
                  axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php', submissionData1)
                      .then(res2 => {
                        
                    console.log("insert id:", res);
                    toast.success('Form submitted successfully');

                  })
                  .catch(err => {
                      console.error('Error submitting form:', err);
                      toast.error('Error submitting form');
                  });
                //  insert  billing

                  })
                  .catch(err => {
                      console.error('Error submitting form:', err);
                      toast.error('Error submitting form');
                  });
                   
                })
                .catch(err => {
                    console.error('Error submitting form:', err);
                    toast.error('Error submitting form');
                });

        } else {
            // Handle validation error scrolling
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

    const renderField = (field, entryIndex = 0) => {
        const fieldKey = `${field.field_name}_${entryIndex}`;
        const darkModeClasses = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';
        const hasError = validationErrors[fieldKey];
        const isInvalid = formTouched && hasError;
        const isRequired = field.field_name.includes('email');

        const getFieldFeedback = () =>
            isInvalid && (
                <Form.Control.Feedback type="invalid">
                    {validationErrors[fieldKey]}
                </Form.Control.Feedback>
            );

        const getInvalidFeedbackDiv = () =>
            isInvalid && (
                <div className="invalid-feedback d-block">
                    {validationErrors[fieldKey]}
                </div>
            );

        return (
            <Form.Group className="mb-3 position-relative" key={fieldKey}>
                <Form.Label className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>
                    {field.field_label} {isRequired && <span className="text-danger">*</span>}
                </Form.Label>

                {field.field_type === 'select' && (
                    <>
                        <Form.Select
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
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
                            name={fieldKey}
                            isDisabled={field.readonly}
                            options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
                            value={(formData[fieldKey] || []).map(val => ({ value: val, label: val }))}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                setFormData(prev => ({
                                    ...prev,
                                    [fieldKey]: values
                                }));

                                setTimeout(() => {
                                    validateWithAI({
                                        ...formData,
                                        [fieldKey]: values
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
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
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
                                type={passwordVisibility[fieldKey] ? 'text' : 'password'}
                                name={fieldKey}
                                value={formData[fieldKey] || ''}
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
                                        [fieldKey]: !prev[fieldKey]
                                    }))
                                }
                                className="position-absolute top-50 end-0 translate-middle-y me-3"
                                style={{ cursor: 'pointer', zIndex: 10 }}
                            >
                                <i className={`bi ${passwordVisibility[fieldKey] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
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
                                    name={fieldKey}
                                    value={opt}
                                    checked={formData[fieldKey] === opt}
                                    onChange={handleChange}
                                    className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                    id={`${fieldKey}-${idx}`}
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
                                    name={fieldKey}
                                    value={opt}
                                    checked={formData[fieldKey]?.includes(opt)}
                                    onChange={handleChange}
                                    className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                    id={`${fieldKey}-${idx}`}
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
                            name={fieldKey}
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
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
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
          //  maxWidth: '1400px',
          //add by tejasvi for full screen 
          maxWidth: '100%',
          width: '100%',
            border: `1px solid ${themeStyles.borderColor}`,
        },
        accordionStyles: {
            backgroundColor: themeStyles.accordionBg,
            borderRadius: '8px',
            marginBottom: '0.75rem',
            border: `1px solid ${themeStyles.borderColor}`,
            overflow: 'hidden',
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
                                                <span>
                                                    {validating
                                                        ? 'Validating form...'
                                                        : formErrors
                                                            ? `${formErrors} validation error${formErrors > 1 ? 's' : ''} found`
                                                            : 'All fields are valid!'
                                                    }
                                                </span>
                                            </div>
                                        </Alert>
                                    </div>

                                    <Form onSubmit={handleSubmit}>
                                        <Accordion
                                            activeKey={activeKey}
                                            onSelect={(k) => setActiveKey(k)}
                                            className="mb-4"
                                        >
                                            {categories.map((category, categoryIndex) => (
                                                
                                                <Accordion.Item
                                                    eventKey={categoryIndex.toString()}
                                                    key={category.category_key}
                                                    style={fullScreenStyles.accordionStyles}
                                                >
                                                    <Accordion.Header
                                                        className={`d-flex justify-content-between align-items-center ${
                                                            theme === 'dark' ? 'bg-dark text-light' : ''
                                                          }`}
                                                          style={{
                                                            backgroundColor: themeStyles.accordionHeader,
                                                            fontFamily: "'Maven Pro', sans-serif",
                                                       
                                                          }}
                                                    >
                                                      <div className="d-flex align-items-center gap-2">
                                                      <i className={category.badge}></i>
                                                            <span className="fw-bold">
                                                           
                                                                {category.category_label || formatFieldName(category.category_key)}
                                                            </span>
                                                            {category.is_multiple === 'yes' && (
                                                                <Badge bg={theme === 'dark' ? 'secondary' : 'primary'} className="ms-2">
                                                                    {(categoryEntries[category.category_key]?.length || 1)} entr{(categoryEntries[category.category_key]?.length || 1) === 1 ? 'y' : 'ies'}
                                                                </Badge>
                                                                )}
                                                        </div>
                                                    </Accordion.Header>
                                                    <Accordion.Body
                                                        className={theme === 'dark' ? 'bg-dark text-light' : ''}
                                                        style={{
                                                            backgroundColor: themeStyles.accordionBg,
                                                            fontFamily: "'Maven Pro', sans-serif"
                                                        }}
                                                    >
                                                        {(categoryEntries[category.category_key] || [0]).map((entryIndex, idx) => (
                                                            <div key={entryIndex} className="mb-4">
                                                                {category.is_multiple === 'yes' && (categoryEntries[category.category_key] || []).length > 1 && (
                                                                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded"
                                                                        style={{
                                                                            backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa',
                                                                            border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
                                                                        }}>
                                                                        <h6 className="mb-0 fw-bold">
                                                                            Entry #{idx + 1}
                                                                        </h6>
                                                                        {(categoryEntries[category.category_key] || []).length > 1 && (
                                                                            <Button
                                                                                variant={themeStyles.buttonSecondary}
                                                                                size="sm"
                                                                                onClick={() => removeCategoryEntry(category.category_key, entryIndex)}
                                                                                className="d-flex align-items-center gap-1"
                                                                            >
                                                                                <i className="bi bi-trash3"></i>
                                                                                Remove
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <Row>
                                                                    {category.fields && category.fields.map((field, fieldIndex) => (
                                                                        <Col
                                                                            key={`${field.field_name}_${entryIndex}`}
                                                                            xs={12}
                                                                            md={field.field_type === 'textarea' ? 12 : 6}
                                                                            lg={field.field_type === 'textarea' ? 12 : 4}
                                                                        >
                                                                            {renderField(field, entryIndex)}
                                                                        </Col>
                                                                    ))}
                                                                </Row>
                                                            </div>
                                                        ))}

                                                        {category.is_multiple === 'yes' && (
                                                            <div className="text-center mt-3">
                                                                <Button
                                                                    variant={themeStyles.buttonPrimary}
                                                                    onClick={() => addCategoryEntry(category.category_key)}
                                                                    className="d-flex align-items-center gap-2 mx-auto"
                                                                >
                                                                    <i className="bi bi-plus-circle"></i>
                                                                    Add Another {category.category_label || formatFieldName(category.category_key)}
                                                                </Button>
                                                            </div>
                                                        )}
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