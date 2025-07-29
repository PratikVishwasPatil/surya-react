import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col, Card, Spinner, Alert, Accordion, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation, useParams } from 'react-router-dom';

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
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const location = useLocation();
    const params = useParams();

    // Check if we're in edit mode
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/add-user/')) {
            const id = path.split('/add-user/')[1];
            setIsEditMode(true);
            setEditId(id);
        }
    }, [location]);

    const path = location.pathname.split('/').pop();
    const formattedTitle = isEditMode ? 'Add User' : (path
        ? path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Dynamic Form');

    useEffect(() => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;700&display=swap';
        document.head.appendChild(linkElement);

        document.body.style.fontFamily = "'Maven Pro', sans-serif";

        setLoading(true);
        // const formName = formattedTitle;
        const formName = "Add User";

        // Fetch form fields
        // axios.get('http://localhost:5000/get_fields', {
        //     params: { form_name: formName }
        // })
        
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

                // Initialize form with default values
                const defaultForm = {};
                fetchedCategories.forEach(category => {
                    category.fields.forEach(field => {
                        defaultForm[field.field_name] = field.field_type === 'checkbox' || field.field_type === 'multiselect'
                            ? []
                            : '';
                    });
                });

                setFormData(defaultForm);

                // If in edit mode, fetch existing data
                if (isEditMode && editId) {
                    fetchEditData(editId, defaultForm);
                } else {
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Error fetching fields:", err);
                setLoading(false);
            });

        // Fetch countries
        axios.get('http://localhost:5000/api/countries')
            .then(response => {
                setCountries(response.data);
            })
            .catch(err => {
                console.error("Error fetching countries:", err);
            });
    }, [isEditMode, editId]);


    // Fetch existing data for edit mode - Dynamic Version
    const fetchEditData = async (id, defaultFormData) => {
        try {
            const requestData = {
                type: "SelectwithWhereConditionWithColumnName",
                table: "submitted_forms",
                form_name: "Add User",
                whereCondition: [
                    {
                        id: id
                    }
                ]
            };

            const response = await axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/selectData.php', requestData);

            // Check if response has the expected structure
            if (response.data && response.data.status === 'success' && response.data.data && response.data.data.length > 0) {
                const existingData = response.data.data[0]; // Access the first item in the data array

                // Since your API returns flat object structure (not nested form_data), 
                // we can directly use the existingData
                let parsedFormData = { ...existingData };

                // Remove non-form fields dynamically
                const nonFormFields = ['form_name', 'id', 'created_at', 'updated_at'];
                nonFormFields.forEach(field => {
                    delete parsedFormData[field];
                });

                // Get all form field names from categories to create dynamic mapping
                const formFieldNames = new Set();
                categories.forEach(category => {
                    category.fields.forEach(field => {
                        formFieldNames.add(field.field_name);
                    });
                });

                // Create dynamic mapping based on actual form fields
                const mappedFormData = {};

                // First, add all existing data as-is
                Object.keys(parsedFormData).forEach(key => {
                    mappedFormData[key] = parsedFormData[key];
                });

                // Then, try to match fields by converting spaces to camelCase or vice versa
                formFieldNames.forEach(formFieldName => {
                    // If the field doesn't exist in mapped data, try to find it with different naming conventions
                    if (!(formFieldName in mappedFormData)) {
                        // Convert camelCase to space-separated (e.g., 'empCode' -> 'emp code')
                        const spaceVersion = formFieldName.replace(/([A-Z])/g, ' $1').toLowerCase().trim();

                        // Convert space-separated to camelCase (e.g., 'emp code' -> 'empCode')
                        const camelCaseVersion = formFieldName.replace(/\s+(.)/g, (match, letter) => letter.toUpperCase());

                        // Check if any version exists in the API response
                        if (parsedFormData[spaceVersion] !== undefined) {
                            mappedFormData[formFieldName] = parsedFormData[spaceVersion];
                        } else if (parsedFormData[camelCaseVersion] !== undefined) {
                            mappedFormData[formFieldName] = parsedFormData[camelCaseVersion];
                        }
                    }
                });

                // Merge with default form data to ensure all fields are present
                const mergedFormData = { ...defaultFormData, ...mappedFormData };

                // Handle array fields and special conversions dynamically
                Object.keys(mergedFormData).forEach(key => {
                    const value = mergedFormData[key];

                    // Find the field configuration to determine its type
                    let fieldConfig = null;
                    categories.forEach(category => {
                        const field = category.fields.find(f => f.field_name === key);
                        if (field) {
                            fieldConfig = field;
                        }
                    });

                    if (typeof value === 'string' && value.trim() !== '') {
                        // Handle array fields based on field type
                        if (fieldConfig && (fieldConfig.field_type === 'multiselect' || fieldConfig.field_type === 'checkbox')) {
                            try {
                                const parsed = JSON.parse(value);
                                if (Array.isArray(parsed)) {
                                    mergedFormData[key] = parsed;
                                } else {
                                    // If it's a string but should be an array, split by comma
                                    mergedFormData[key] = value.split(',').map(item => item.trim()).filter(item => item !== '');
                                }
                            } catch (e) {
                                // If JSON parsing fails, try splitting by comma
                                mergedFormData[key] = value.split(',').map(item => item.trim()).filter(item => item !== '');
                            }
                        } else {
                            // Handle boolean-like strings
                            if (value.toLowerCase() === 'yes') {
                                mergedFormData[key] = true;
                            } else if (value.toLowerCase() === 'no') {
                                mergedFormData[key] = false;
                            }
                            // Keep as string for other cases
                        }
                    } else if (value === null || value === undefined) {
                        // Set appropriate default values based on field type
                        if (fieldConfig) {
                            if (fieldConfig.field_type === 'multiselect' || fieldConfig.field_type === 'checkbox') {
                                mergedFormData[key] = [];
                            } else {
                                mergedFormData[key] = '';
                            }
                        }
                    }
                });

                console.log('Merged Form Data:', mergedFormData); // Debug log
                setFormData(mergedFormData);
                toast.success('User data loaded successfully');

            } else {
                console.log('API Response:', response.data); // Debug log
                toast.error('No user data found');
            }
        } catch (error) {
            console.error("Error fetching edit data:", error);
            console.error("Response:", error.response?.data); // Additional debug info
            toast.error('Error loading user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost/surya_apis/api/get_statelist.php`)
            .then(response => {
                setStates(response.data.data);
            })
            .catch(err => {
                console.error("Error fetching states:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const stateId = formData.state;

        if (stateId) {
            setLoading(true);

            const formDataForPost = new FormData();
            formDataForPost.append('state', stateId);

            axios.post(`http://localhost/surya_apis/api/get_citylist.php`, formDataForPost)
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

        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }

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

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setFormTouched(true);

    //     const isValid = await validateWithAI(formData);
    //     if (isValid) {
    //         let submissionData;

    //         if (isEditMode && editId) {
    //             // Update existing record
    //             submissionData = {
    //                 type: "update_value_in_json_on_jsonvalue",
    //                 table: "submitted_forms",
    //                 form_name: formattedTitle,
    //                 updateData: {
    //                     form_data: {
    //                         ...formData,
    //                         form_name: formattedTitle
    //                     }
    //                 },
    //                 whereCondition: [
    //                     {
    //                         id: editId
    //                     }
    //                 ]
    //             };
    //         } else {
    //             // Insert new record
    //             submissionData = {
    //                 type: "insert",
    //                 table: "submitted_forms",
    //                 form_name: formattedTitle,
    //                 insert_array: [
    //                     {
    //                         form_data: {
    //                             ...formData,
    //                             form_name: formattedTitle
    //                         }
    //                     }
    //                 ]
    //             };
    //         }

    //         const apiUrl = isEditMode
    //             ? 'http://localhost/surya_apis/updateData.php'
    //             : 'http://localhost/surya_apis/insertData.php';

    //         axios.post(apiUrl, submissionData)
    //             .then(res => {
    //                 const message = isEditMode ? 'User updated successfully' : 'Form submitted successfully';
    //                 toast.success(message);
    //                 if (!isEditMode) {
    //                     handleReset();
    //                 }
    //             })
    //             .catch(err => {
    //                 console.error('Error submitting form:', err);
    //                 const errorMessage = isEditMode ? 'Error updating user' : 'Error submitting form';
    //                 toast.error(errorMessage);
    //             });
    //     } else {
    //         const firstErrorField = Object.keys(validationErrors)[0];
    //         const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
    //         if (errorElement) {
    //             errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //             errorElement.focus();
    //         }
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormTouched(true);

        const isValid = await validateWithAI(formData);

        if (isValid) {
            let submissionData;

            if (isEditMode && editId) {
                // Update existing record
                submissionData = {
                    type: "update_value_in_json_on_jsonvalue",
                    table: "submitted_forms",
                    form_name: formattedTitle,
                    update_values: [
                        {
                            form_data: {
                                ...formData,
                                form_name: formattedTitle
                            }
                        }
                    ],
                    where_values: [
                        {
                            id: editId
                        }
                    ]
                };
            } else {
                // Insert new record
                submissionData = {
                    type: "insert",
                    table: "submitted_forms",
                    form_name: formattedTitle,
                    insert_array: [
                        {
                            form_data: {
                                ...formData,
                                form_name: formattedTitle
                            }
                        }
                    ]
                };
            }

            const apiUrl = isEditMode
                ? 'http://93.127.167.54/Surya_React/surya_dynamic_api/updateData.php'
                : 'http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php';

            axios.post(apiUrl, submissionData)
                .then(res => {
                    const message = isEditMode ? 'User updated successfully' : 'Form submitted successfully';
                    toast.success(message);
                    if (!isEditMode) {
                        handleReset();
                    }
                })
                .catch(err => {
                    console.error('Error submitting form:', err);
                    const errorMessage = isEditMode ? 'Error updating user' : 'Error submitting form';
                    toast.error(errorMessage);
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
                                        {formTitle} {isEditMode && <Badge bg="info" className="ms-2">ID: {editId}</Badge>}
                                    </h4>

                                    <p className="mb-0" style={{
                                        fontSize: '0.9rem',
                                        color: themeStyles.textSecondary,
                                        fontWeight: '400'
                                    }}>
                                        {isEditMode ? 'Update the information below and save changes' : 'Please fill out all required fields'}
                                    </p>
                                </div>
                                <button
                                    style={fullScreenStyles.themeToggle}
                                    onClick={toggleTheme}
                                    className="hover-effect"
                                >
                                    <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`}></i>
                                    {theme === 'dark' ? 'Light' : 'Dark'}
                                </button>
                            </div>
                        </div>

                        <div className="p-4" style={{ backgroundColor: themeStyles.formBg }}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} />
                                    <p className={`mt-3 ${theme === 'dark' ? 'text-light' : ''}`}>
                                        Loading form fields...
                                    </p>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    {categories.map((category, categoryIndex) => (
                                        <Accordion
                                            key={category.id}
                                            activeKey={activeKey}
                                            onSelect={(key) => setActiveKey(key)}
                                            className="mb-4"
                                        >
                                            <Accordion.Item
                                                eventKey={categoryIndex.toString()}
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
                                                <Accordion.Body style={{
                                                    backgroundColor: themeStyles.accordionBg,
                                                    padding: '1.5rem'
                                                }}>
                                                    <Row>
                                                        {category.fields.map((field) => (
                                                            <Col
                                                                key={field.field_name}
                                                                xs={12}
                                                                md={field.field_type === 'textarea' ? 12 : 6}
                                                                lg={field.field_type === 'textarea' ? 12 : 4}
                                                            >
                                                                {renderField(field)}
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    ))}

                                    {formErrors > 0 && formTouched && (
                                        <Alert variant="danger" className="mb-4">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                <div>
                                                    <strong>Please fix the following errors:</strong>
                                                    <ul className="mb-0 mt-2">
                                                        {Object.entries(validationErrors).map(([field, error]) => (
                                                            <li key={field}>
                                                                <strong>{formatFieldName(field)}:</strong> {error}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Alert>
                                    )}

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
                                            ) : "Update Form"}
                                        </Button>

                                    </div>
                                </Form>
                            )}
                        </div>
                    </div>
                </div>
            </Container>

            <style jsx>{`
                .react-select-container .react-select__control {
                    border-radius: 6px;
                    border: 1px solid #ced4da;
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                    transition: all 0.15s ease-in-out;
                }

                .react-select-container .react-select__control:hover {
                    border-color: #86b7fe;
                }

                .react-select-container .react-select__control--is-focused {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .hover-effect:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .form-control:focus, .form-select:focus {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .btn:hover {
                    transform: translateY(-1px);
                    transition: all 0.2s ease;
                }

                .accordion-button:not(.collapsed) {
                    background-color: ${themeStyles.accordionHeader};
                    color: ${themeStyles.color};
                    box-shadow: none;
                }

                .accordion-button:focus {
                    border-color: ${theme === 'dark' ? '#495057' : '#86b7fe'};
                    box-shadow: 0 0 0 0.25rem ${theme === 'dark' ? 'rgba(73, 80, 87, 0.25)' : 'rgba(13, 110, 253, 0.25)'};
                }

                .accordion-button::after {
                    filter: ${theme === 'dark' ? 'invert(1)' : 'none'};
                }

                .form-check-input:checked {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }

                .form-check-input:focus {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .invalid-feedback {
                    display: block !important;
                }

                @media (max-width: 768px) {
                    .form-header {
                        padding: 1rem !important;
                    }
                    
                    .form-header h4 {
                        font-size: 1.1rem !important;
                    }
                    
                    .theme-toggle {
                        font-size: 0.8rem !important;
                        padding: 0.3rem 0.6rem !important;
                    }
                }
            `}</style>
        </>
    );
}

export default DynamicForm;