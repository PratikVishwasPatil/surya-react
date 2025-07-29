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

    // New state for managing group entries
    const [groupEntries, setGroupEntries] = useState({});
    const [multipleFieldGroups, setMultipleFieldGroups] = useState({});

    const location = useLocation();
    const path = location.pathname.split('/').pop();
    const formattedTitle = path
        ? path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Dynamic Form';

    // Load states
    useEffect(() => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;700&display=swap';
        document.head.appendChild(linkElement);

        document.body.style.fontFamily = "'Maven Pro', sans-serif";

        setLoading(true);

        const formName = formattedTitle;

        const submissionData = {
            form_name: formName
        };
        axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/get_fields.php',submissionData)
          
            .then((res) => {
                const fetchedCategories = res.data;

                fetchedCategories.sort((a, b) => a.sequence - b.sequence);

                fetchedCategories.forEach(category => {
                    category.is_multiple = category.fields.some(field => field.is_multiple === 'yes' || field.is_multiple === '1');
                    category.fields.forEach(field => {
                        field.field_label = field.field_label || formatFieldName(field.field_name);
                        field.field_type = field.field_type;

                        // Add is_multiple property to individual fields
                      //  const multipleFields = ['contact person name', 'contact person email', 'contact person mobile', 'contact person designation','store location'];
                        field.is_multiple = field.is_multiple === 'yes' || field.is_multiple === '1';
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

                // Initialize form data and group entries
                const defaultForm = {};
                const defaultGroupEntries = {};
                const defaultMultipleFieldGroups = {};

                fetchedCategories.forEach((category) => {
                    if (category.is_multiple) {
                      defaultForm[category.category_key] = [
                        Object.fromEntries(
                          category.fields.filter(field => field.is_multiple).map((field) => [
                        field.field_name,
                        [''],
                          ])
                        ),
                      ];
                    } else {
                      category.fields.forEach((field) => {
                        defaultForm[field.field_name] = field.is_multiple ? [''] : '';
                      });
                    }
                  });
          

                setFormData(defaultForm);
                setGroupEntries(defaultGroupEntries);

                setMultipleFieldGroups(defaultMultipleFieldGroups);
            })
            .catch((err) => {
                console.error("Error fetching fields:", err);
            })
            .finally(() => {
                setLoading(false);
            });

        // axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/countries')
        //     .then(response => {
        //         setCountries(response.data);
        //     })
        //     .catch(err => {
        //         console.error("Error fetching countries:", err);
        //     });
    }, []);

    useEffect(() => {
        axios.post(`http://93.127.167.54/Surya_React/surya_dynamic_api/get_statelist.php`)
            .then(response => {
              console.log("response");
              console.log(response);
              setStates(response.data.data); 
              //  setStates(response.data.data);
            })
            .catch(err => {
                console.error("Error fetching states:", err);
            });
    }, []);

    // Load cities based on state selection
    useEffect(() => {
        const stateFields = Object.keys(formData).filter(key => key.startsWith('state_') || key === 'state');
        const stateField = stateFields.find(field => formData[field]);

        if (stateField && formData[stateField]) {
            const formDataObj = new FormData();
            formDataObj.append('state', formData[stateField]);

            axios.post(`http://93.127.167.54/Surya_React/surya_dynamic_api/get_citylist.php`, formDataObj)
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

    // Add new group of fields
    // const addFieldGroup = (groupKey) => {
    //     setGroupEntries(prev => {
    //         const currentEntries = prev[groupKey] || [0];
    //         const newIndex = Math.max(...currentEntries) + 1;
    //         const newEntries = [...currentEntries, newIndex];

    //         // Initialize form data for all fields in this group
    //         setFormData(prevFormData => {
    //             const newFormData = { ...prevFormData };
    //             const fieldsInGroup = multipleFieldGroups[groupKey] || [];

    //             fieldsInGroup.forEach(fieldName => {
    //                 const field = getFieldByName(fieldName);
    //                 newFormData[`${fieldName}_${newIndex}`] = field && (field.field_type === 'checkbox' || field.field_type === 'multiselect') ? [] : '';
    //             });

    //             return newFormData;
    //         });

    //         return {
    //             ...prev,
    //             [groupKey]: newEntries
    //         };
    //     });
    // };

    // Remove group of fields
    const removeFieldGroup = (groupKey, entryIndex) => {
        setGroupEntries(prev => {
            const currentEntries = prev[groupKey] || [0];
            if (currentEntries.length <= 1) return prev; // Don't allow removing the last group

            const newEntries = currentEntries.filter(index => index !== entryIndex);

            // Remove form data for all fields in this group
            setFormData(prevFormData => {
                const newFormData = { ...prevFormData };
                const fieldsInGroup = multipleFieldGroups[groupKey] || [];

                fieldsInGroup.forEach(fieldName => {
                    delete newFormData[`${fieldName}_${entryIndex}`];
                });

                return newFormData;
            });

            return {
                ...prev,
                [groupKey]: newEntries
            };
        });
    };

    // Helper function to get field by name
    const getFieldByName = (fieldName) => {
        for (const category of categories) {
            const field = category.fields.find(f => f.field_name === fieldName);
            if (field) return field;
        }
        return null;
    };

    // Check if field belongs to a group
    const getFieldGroupKey = (fieldName) => {
        for (const [groupKey, fields] of Object.entries(multipleFieldGroups)) {
            if (fields.includes(fieldName)) {
                return groupKey;
            }
        }
        return null;
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
        const resetGroupEntries = {};
        const resetMultipleFieldGroups = {};

        categories.forEach(category => {
            // Find fields marked as multiple in this category
            const multipleFields = category.fields.filter(field => field.is_multiple === 'yes');

            if (multipleFields.length > 0) {
                // Create a group for this category's multiple fields
                const groupKey = `${category.category_name}_group`;
                resetGroupEntries[groupKey] = [0]; // Start with first group
                resetMultipleFieldGroups[groupKey] = multipleFields.map(field => field.field_name);

                // Initialize form data for multiple fields
                multipleFields.forEach(field => {
                    resetForm[`${field.field_name}_0`] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                });
            }

            // Initialize single fields
            category.fields.forEach(field => {
                if (field.is_multiple === 'no') {
                    resetForm[field.field_name] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                }
            });
        });

        setFormData(resetForm);
        setGroupEntries(resetGroupEntries);
        setMultipleFieldGroups(resetMultipleFieldGroups);
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

    const renderField = (field, value, onChange, groupIndex = null, groupKey = null) => {
      
      if (field.is_multiple && Array.isArray(value)) {
        console.log("Rendering field:", field.field_name, field.field_type, field.options);
          return (
              <>
                  <Form.Label className="fw-bold d-block">{field.field_label}</Form.Label>
                  {value.map((val, idx) => (
                      <div key={idx} className="d-flex mb-2 align-items-center">
                          <Form.Control
                              type="text"
                              value={val}
                              onChange={(e) => {
                                  const updated = [...value];
                                  updated[idx] = e.target.value;
                                  const updatedFormData = { ...formData };
                                  if (groupKey !== null && groupIndex !== null) {
                                      updatedFormData[groupKey][groupIndex][field.field_name] = updated;
                                  } else {
                                      updatedFormData[field.field_name] = updated;
                                  }
                                  setFormData(updatedFormData);
                              }}
                              className="me-2"
                          />
                      </div>
                  ))}
              </>
          );
      }
  
      // ✅ Handle Select Input
      if (field.field_type === 'select') {
          return (
              <Form.Group className="mb-3">
                  <Form.Label>{field.field_label}</Form.Label>
                  <Form.Select value={value || ''} onChange={onChange}>
                      <option value="">Select {field.field_label}</option>
                      {field.options && field.options.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                      ))}
                  </Form.Select>
              </Form.Group>
          );
      }
  
      return (
          <Form.Group className="mb-3">
              <Form.Label>{field.field_label}</Form.Label>
              <Form.Control
                  type={field.field_type || 'text'}
                  value={value || ''}
                  onChange={onChange}
                  placeholder={`Enter ${field.field_label}`}
              />
          </Form.Group>
      );
  };
  
      const renderGroupedFields = (category) => {
        const groupData = formData[category.category_key] || [];
        return (
          <>
            {groupData.map((entry, index) => (
              <Card className="mb-3" key={index}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="fw-bold text-primary">${category.category_label} #${index + 1}</div>
                    {groupData.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          const updated = groupData.filter((_, i) => i !== index);
                          setFormData((prev) => ({
                            ...prev,
                            [category.category_key]: updated,
                          }));
                        }}
                      >
                        <i className="bi bi-trash"></i> Remove
                      </Button>
                    )}
                  </div>
                  <Row>
                    {category.fields.filter(f => f.is_multiple).map((field, fIdx) => (
                      <Col md={6} key={fIdx}>
                        {renderField(
                          field,
                          entry[field.field_name],
                          (e) => {
                            const updated = [...groupData];
                            updated[index][field.field_name] = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              [category.category_key]: updated,
                            }));
                          },
                          index,
                          category.category_key
                        )}
                      </Col>
                    ))}
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
                    category.fields.map((field) => [
                      field.field_name,
                      field.is_multiple ? [''] : '',
                    ])
                  );
                  setFormData((prev) => ({
                    ...prev,
                    [category.category_key]: [...(prev[category.category_key] || []), newGroup],
                  }));
                }}
              >
                <i className="bi bi-plus-circle"></i> Add {category.category_label}
              </Button>
            </div>
          </>
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

    const formTitle = formattedTitle;

    return (
        <Container className="py-4">
        <ToastContainer />
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
          <input type="hidden" name="form_name" value={formTitle} />
          <Accordion defaultActiveKey="0" activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
           
              {categories.map((cat, idx) => {
                const currentGroupEntries = formData[cat.category_key] || [];
                const hasMultipleFields = cat.is_multiple;
                return (
                  <Accordion.Item eventKey={String(idx)} key={cat.category_key}>
                    <Accordion.Header
                      className="fw-bold bg-light"
                      style={{ fontFamily: "'Maven Pro', sans-serif", fontSize: '1.1rem' }}
                    >
                      <div className="d-flex align-items-center justify-content-between w-100 me-3">
                        <span className="fw-bold">{cat.category_label}</span>
                        {hasMultipleFields && (
                          <Badge bg="primary" className="ms-2">
                            {currentGroupEntries.length} entr{currentGroupEntries.length === 1 ? 'y' : 'ies'}
                          </Badge>
                        )}
                      </div>
                     
                    </Accordion.Header>
                    <Accordion.Body>
                      {cat.is_multiple ? renderGroupedFields(cat) : (
                        <Row>
                          {cat.fields.map((field, i) => (
                            <Col md={6} key={i}>
                              {renderField(field, formData[field.field_name], (e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  [field.field_name]: e.target.value
                                }))
                              })}
                            </Col>
                          ))}
                        </Row>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
            <div className="text-center mt-4">
              <Button type="submit">Submit</Button>
            </div>
          </Form>
        )}
      </Container>
      );
    }
    
export default DynamicForm;