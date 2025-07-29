import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useNavigate } from "react-router-dom";
import { ModuleRegistry } from "ag-grid-community";
import {
    ClientSideRowModelModule,
    ValidationModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
} from "ag-grid-community";
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Button, Row, Col, Card, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
]);

const GridExample = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const gridRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();

    // Customizable gradient colors - easily adjustable
    const gradientColors = {
        dark: {
            color1: '#1a1a2e',
            color2: '#16213e',
            percentage1: '0%',
            percentage2: '100%',
            angle: '135deg'
        },
        light: {
            color1: '#f8f9ff',
            color2: '#e6f3ff',
            percentage1: '0%',
            percentage2: '100%',
            angle: '135deg'
        }
    };

    // Format title from route or use default
    const path = location.pathname.split('/').pop();
    const formattedTitle = path
        ? path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Dynamic AI Form';

    const formTitle = formattedTitle;

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Function to create column name from field key
    const createColumnName = (key) => {
        return key
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    };

    // Function to determine column width based on content and field type
    const getColumnWidth = (key, sampleValue) => {
        const baseWidth = isMobile ? 120 : 150;
        const keyLength = key.length;
        const valueLength = sampleValue ? String(sampleValue).length : 0;

        // Calculate width based on content length
        const contentWidth = Math.max(keyLength, valueLength) * 8 + 40;
        const minWidth = isMobile ? 100 : 120;
        const maxWidth = isMobile ? 200 : 300;

        return Math.min(Math.max(contentWidth, minWidth), maxWidth);
    };

    // Enhanced function to clean HTML content and extract text
    const cleanHtmlContent = (value) => {
        if (!value) return '-';

        // Handle different data types
        if (typeof value !== 'string') {
            return String(value);
        }

        // Check if value contains HTML tags
        const hasHTMLTags = /<[^>]*>/g.test(value);

        if (!hasHTMLTags) {
            // No HTML tags, return as is (but handle empty strings)
            return value.trim() || '-';
        }

        // Create a temporary DOM element to parse HTML safely
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;

        // Extract text content
        let cleanValue = tempDiv.textContent || tempDiv.innerText || '';

        // Additional cleanup for common HTML entities
        cleanValue = cleanValue
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .trim();

        // Return dash if empty after cleaning
        return cleanValue || '-';
    };

    // Enhanced function to check if value is effectively empty
    const isEmptyValue = (value) => {
        if (!value) return true;

        if (typeof value === 'string') {
            // Clean HTML and check if result is empty
            const cleaned = cleanHtmlContent(value);
            return cleaned === '-' || cleaned.trim() === '';
        }

        return false;
    };

    // Function to dynamically generate column definitions
    const generateColumnDefs = (data) => {
        if (!data || data.length === 0) return [];

        const firstRow = data[0];
        const keys = Object.keys(firstRow);

        const dynamicColumns = [
            // Serial Number Column
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' },
                suppressSizeToFit: true
            }
        ];

        // Add checkbox selection to first data column
        let isFirstDataColumn = true;

        keys.forEach((key, index) => {
            const sampleValue = firstRow[key];
            const columnWidth = getColumnWidth(key, sampleValue);

            const columnDef = {
                field: key,
                headerName: createColumnName(key),
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: columnWidth,
                minWidth: isMobile ? 80 : 100,
                resizable: true,
                sortable: true,
                ...(isFirstDataColumn && {
                    checkboxSelection: true,
                    headerCheckboxSelection: true,
                    pinned: 'left',
                    lockPosition: true
                }),
                // Hide some columns on mobile to prevent overcrowding
                ...(isMobile && index > 2 && !isFullScreen && {
                    hide: true
                }),
                // Enhanced cell renderer with better HTML handling
                cellRenderer: (params) => {
                    let value = params.value;

                    // Handle null/undefined values first
                    if (value === null || value === undefined) {
                        return '-';
                    }

                    // Clean HTML content
                    const cleanedValue = cleanHtmlContent(value);

                    // Handle empty values after cleaning
                    if (cleanedValue === '-' || cleanedValue === '') {
                        return '-';
                    }

                    // Format dates
                    if (key.toLowerCase().includes('date') && cleanedValue !== '-') {
                        try {
                            const date = new Date(cleanedValue);
                            if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString();
                            }
                        } catch (e) {
                            // If date parsing fails, return cleaned value
                        }
                    }

                    // Return cleaned value
                    return cleanedValue;
                },
                // Enhanced value getter for sorting and filtering
                valueGetter: (params) => {
                    const value = params.data[key];
                    return cleanHtmlContent(value);
                }
            };

            dynamicColumns.push(columnDef);
            isFirstDataColumn = false;
        });

        return dynamicColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        flex: isMobile ? 1 : 0,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    // Fetch data from API with enhanced error handling
    const fetchData = async () => {
        setLoading(true);
        try {
            let newFormName = '';
            if (formattedTitle === 'User List') {
                newFormName = 'Add User';
            }else if(formattedTitle === 'Company List'){
                newFormName = 'Add Company';
            } else {
                newFormName = 'Add Student';
            }
            let  requestPayload1 = [];
            if(formattedTitle === 'Company List'){
                console.log('formattedTitle',formattedTitle);
                  requestPayload1 = {
                    type: "SelectwithWhereConditionWithColumnName",
                    table: "submitted_forms",
                    form_name: newFormName,
                    "whereCondition": [
                        {
                            "ref_id": 0
                        }
                    ]
                };
            }else{
                 requestPayload1 = {
                    type: "SelectAll",
                    table: "submitted_forms",
                    form_name: newFormName
                };
            }
            const requestPayload = requestPayload1;

            const response = await fetch("http://93.127.167.54/Surya_React/surya_dynamic_api/selectData.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {

                // Enhanced data cleaning and formatting
                const formattedData = data.data.map((row, index) => {
                    const cleanedRow = {};
                    Object.entries(row).forEach(([key, value]) => {
                        // Clean HTML content from all fields
                        cleanedRow[key] = cleanHtmlContent(value);
                    });
                    return cleanedRow;
                });

                setRowData(formattedData);

                // Generate dynamic column definitions
                const dynamicColumnDefs = generateColumnDefs(formattedData);
                setColumnDefs(dynamicColumnDefs);
            } else {
                console.warn("No data received or invalid response format:", data);
                setRowData([]);
                setColumnDefs([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setRowData([]);
            setColumnDefs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isMobile, isFullScreen]);

    // Edit functionality - Navigate to edit page with selected row ID
    const handleEditRow = () => {
        if (selectedRows.length !== 1) {
            toast.error('Please select exactly one row to edit');
            return;
        }

        const selectedRow = selectedRows[0];

        // Check if the row has an ID field
        if (!selectedRow.id) {
            toast.error('Selected row does not have an ID field');
            return;
        }

        // Navigate to edit-user route with the ID
        navigate(`/add-user/${selectedRow.id}`, {
            state: {
                userData: selectedRow,
                formTitle: formTitle
            }
        });
    };

    // Delete functionality
    const handleDeleteRows = async () => {
        if (selectedRows.length === 0) return;

        setDeleteLoading(true);
        let newFormName = '';
        if (formattedTitle === 'User List') {
            newFormName = 'Add User';
        }else if(formattedTitle === 'Company List'){
            newFormName = 'Add Company';
        } else {
            newFormName = 'Add Student';
        }
        try {
            // Delete each selected row
            const deletePromises = selectedRows.map(async (row) => {
                const requestPayload = {
                    type: "delete",
                    table: "submitted_forms",
                    form_name: newFormName,
                    delete_values: {
                        where_values: {
                            id: row.id
                        }
                    }
                };

                const response = await fetch("http://93.127.167.54/Surya_React/surya_dynamic_api/deleteData.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestPayload),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.status !== "success") {
                    throw new Error(data.message || "Delete failed");
                }

                return data;
            });

            await Promise.all(deletePromises);

            // Show success message
            console.log(`Successfully deleted ${selectedRows.length} row(s)`);
            toast.success(`Successfully deleted ${selectedRows.length} row(s)`);

            // Refresh the data
            await fetchData();

            // Clear selection
            setSelectedRows([]);

            // Close modal
            setShowDeleteModal(false);

        } catch (error) {
            toast.error(`Error deleting rows: ${error.message}`);
            console.error("Error deleting rows:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Apply theme to document body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.style.background = 'linear-gradient(135deg, #21262d 0%, #161b22 100%)';
            document.body.style.color = '#f8f9fa';
            document.body.style.minHeight = '100vh';
        } else {
            document.body.style.background = 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)';
            document.body.style.color = '#212529';
            document.body.style.minHeight = '100vh';
        }

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
        };
    }, [theme]);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        if (selectedNodes.length === 1) {
            console.log("Selected row data:", selectedData[0]);
        }
    };

    // Enhanced grid utility functions
    const downloadExcel = () => {
        if (!gridRef.current || !gridRef.current.api) {
            console.warn("Grid API not available");
            return;
        }

        try {
            const api = gridRef.current.api;
            const params = {
                fileName: `${formTitle}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ',',
                processCellCallback: (params) => {
                    // Clean HTML from exported data
                    return cleanHtmlContent(params.value);
                }
            };

            api.exportDataAsCsv(params);
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };

    const sizeToFit = () => {
        if (!gridRef.current?.api) {
            console.warn("Grid API not available");
            return;
        }

        try {
            const api = gridRef.current.api;
            setTimeout(() => {
                api.sizeColumnsToFit();
            }, 100);
        } catch (error) {
            console.error("Error sizing columns to fit:", error);
        }
    };

    const autoSizeAll = () => {
        if (!gridRef.current?.api) {
            console.warn("Grid API not available");
            return;
        }

        try {
            const api = gridRef.current.api;
            const allColumns = api.getAllColumns();
            const allColumnIds = allColumns.map(column => column.getId());

            if (allColumnIds.length > 0) {
                setTimeout(() => {
                    api.autoSizeColumns(allColumnIds, false);
                }, 100);
            }
        } catch (error) {
            console.error("Error auto-sizing columns:", error);
        }
    };

    const getThemeStyles = () => {
        const currentGradient = gradientColors[theme];
        const gradientBackground = `linear-gradient(${currentGradient.angle}, ${currentGradient.color1} ${currentGradient.percentage1}, ${currentGradient.color2} ${currentGradient.percentage2})`;

        if (theme === 'dark') {
            return {
                backgroundColor: gradientBackground,
                color: '#f8f9fa',
                cardBg: '#ffffff',
                cardHeader: 'linear-gradient(135deg,rgb(203, 210, 219) 0%, #161b22 100%)',
                buttonVariant: 'outline-light',
                textClass: 'text-light',
                borderClass: 'border-secondary'
            };
        }
        return {
            backgroundColor: gradientBackground,
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg,rgba(218, 208, 208, 0.67) 0%,rgba(97, 91, 91, 0.56) 100%)',
            buttonVariant: 'outline-dark',
            textClass: 'text-dark',
            borderClass: 'border-light'
        };
    };

    const themeStyles = getThemeStyles();

    const getGridHeight = () => {
        if (isFullScreen) {
            return isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 140px)';
        }
        return isMobile ? '400px' : '600px';
    };

    const gridHeight = getGridHeight();
    const containerStyles = isFullScreen ? {
        margin: 0,
        padding: 0,
        maxWidth: '100%',
        width: '100vw'
    } : {};

    const cardStyles = isFullScreen ? {
        margin: 0,
        borderRadius: 0,
        height: '100vh',
        border: 'none'
    } : {
        margin: isMobile ? '10px' : '20px',
        borderRadius: '8px'
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                    : 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)'
            }}>
                <div style={{ textAlign: 'center', color: theme === 'dark' ? '#f8f9fa' : '#212529' }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading dynamic data...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                    : 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)',
                color: themeStyles.color,
                padding: 0,
                margin: 0,
                overflow: isFullScreen ? 'hidden' : 'auto'
            }}
        >
            <Container
                fluid={isFullScreen}
                style={containerStyles}
                className={isFullScreen ? 'p-0' : ''}
            >
                <Card
                    style={{
                        backgroundColor: themeStyles.cardBg,
                        color: themeStyles.color,
                        border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                        ...cardStyles
                    }}
                >
                    {/* Header */}
                    <Card.Header
                        style={{
                            background: themeStyles.cardHeader,
                            color: '#ffffff',
                            fontFamily: "'Maven Pro', sans-serif",
                            padding: isMobile ? '10px 15px' : '0.5rem 2rem',
                            flexShrink: 0,
                            fontWeight: '100'
                        }}
                    >
                        <Row className="align-items-center g-2">
                            <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                                <h4
                                    className={`mb-0 ${isMobile ? 'fs-6' : ''}`}
                                    style={{
                                        fontFamily: "'Maven Pro', sans-serif",
                                        fontWeight: '100',
                                        color: 'black'
                                    }}
                                >
                                    {isMobile
                                        ? formTitle.substring(0, 20) + (formTitle.length > 20 ? '...' : '')
                                        : formTitle}
                                </h4>
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                    {rowData.length} records found
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-1 flex-wrap">
                                    {/* Mobile: Show only essential buttons */}
                                    {isMobile ? (
                                        <>
                                            {selectedRows.length === 1 && (
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    onClick={handleEditRow}
                                                    title="Edit Selected"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                            )}

                                            {selectedRows.length > 0 && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => setShowDeleteModal(true)}
                                                    title="Delete Selected"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            )}

                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={downloadExcel}
                                                title="Download CSV"
                                            >
                                                <i className="bi bi-download"></i>
                                            </Button>

                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={toggleFullScreen}
                                                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                            >
                                                <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            </Button>

                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={toggleTheme}
                                                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                            >
                                                {theme === 'light' ? '🌙' : '☀️'}
                                            </Button>
                                        </>
                                    ) : (
                                        // Desktop: Show all buttons
                                        <>
                                            {selectedRows.length === 1 && (
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    onClick={handleEditRow}
                                                    title="Edit Selected Row"
                                                >
                                                    <i className="bi bi-pencil"></i> Edit
                                                </Button>
                                            )}

                                            {selectedRows.length > 0 && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => setShowDeleteModal(true)}
                                                    title="Delete Selected Rows"
                                                >
                                                    <i className="bi bi-trash"></i> Delete ({selectedRows.length})
                                                </Button>
                                            )}

                                            <ButtonGroup size="sm">
                                                <Button
                                                    variant="success"
                                                    onClick={downloadExcel}
                                                    title="Download CSV"
                                                >
                                                    <i className="bi bi-file-earmark-excel"></i> Export CSV
                                                </Button>

                                            </ButtonGroup>

                                            <ButtonGroup size="sm">
                                                <Button
                                                    variant="outline-light"
                                                    onClick={toggleFullScreen}
                                                    title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                                >
                                                    <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                                    {isFullScreen ? ' Exit' : ' Full'}
                                                </Button>

                                                <Button
                                                    variant="outline-light"
                                                    onClick={toggleTheme}
                                                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                                >
                                                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                                                </Button>
                                            </ButtonGroup>
                                        </>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Grid Body */}
                    <Card.Body
                        style={{
                            backgroundColor: themeStyles.cardBg,
                            color: themeStyles.color,
                            padding: isFullScreen ? '0' : (isMobile ? '10px' : '15px'),
                            flex: 1,
                            overflow: 'hidden'
                        }}
                    >
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529'
                            }}>
                                <i className="bi bi-inbox" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No data available</h5>
                                <p>Please check your API connection or data source.</p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: "100%",
                                    ...(theme === 'dark' && {
                                        '--ag-background-color': '#212529',
                                        '--ag-header-background-color': '#343a40',
                                        '--ag-odd-row-background-color': '#2c3034',
                                        '--ag-even-row-background-color': '#212529',
                                        '--ag-row-hover-color': '#495057',
                                        '--ag-foreground-color': '#f8f9fa',
                                        '--ag-header-foreground-color': '#f8f9fa',
                                        '--ag-border-color': '#495057',
                                        '--ag-secondary-border-color': '#343a40',
                                        '--ag-header-column-separator-color': '#495057',
                                        '--ag-row-border-color': '#343a40',
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-cell-horizontal-border': '#343a40',
                                        '--ag-header-cell-hover-background-color': '#495057',
                                        '--ag-header-cell-moving-background-color': '#495057',
                                        '--ag-value-change-value-highlight-background-color': '#198754',
                                        '--ag-chip-background-color': '#495057',
                                        '--ag-input-background-color': '#343a40',
                                        '--ag-input-border-color': '#495057',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-minichart-selected-chart-color': '#28a745',
                                        '--ag-minichart-selected-page-color': '#28a745',
                                        '--ag-pinned-left-border': '2px solid #495057',
                                        '--ag-pinned-right-border': '2px solid #495057'
                                    }),
                                    ...(theme === 'light' && {
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-minichart-selected-chart-color': '#28a745',
                                        '--ag-minichart-selected-page-color': '#28a745',
                                        '--ag-checkbox-checked-color': '#28a745',
                                        '--ag-accent-color': '#28a745'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : (isFullScreen ? 20 : 10)}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    enableCharts={!isMobile}
                                    enableAdvancedFilter={!isMobile}
                                    rowMultiSelectWithClick={true}
                                    suppressRowClickSelection={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    suppressColumnVirtualisation={isMobile}
                                    rowBuffer={isMobile ? 5 : 10}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    suppressMenuHide={isMobile}
                                    suppressContextMenu={isMobile}
                                    onGridReady={(params) => {
                                        console.log('Grid is ready');
                                    }}
                                />
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Delete Confirmation Modal */}
                <Modal
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    centered
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete {selectedRows.length} selected row(s)?</p>
                        <p className="text-danger">This action cannot be undone.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteRows}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>Delete {selectedRows.length} Row(s)</>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default GridExample;