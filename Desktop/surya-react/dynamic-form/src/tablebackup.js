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
import { Container, Button, Row, Col, Card, ButtonGroup, Dropdown } from 'react-bootstrap';

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
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const gridRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();

    // Format title from route
    const path = location.pathname.split('/').pop();
    const formattedTitle = path
        ? path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Dynamic Form';

    const formTitle = formattedTitle;

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const columnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "serialNumber",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true
        },
        {
            field: "CUSTOMER_NAME",
            headerName: "Customer Name",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: isMobile ? 150 : 200,
            minWidth: 120,
            pinned: 'left',
            lockPosition: true
        },
        { 
            field: "EMAIL", 
            headerName: "Email", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 200 : 250,
            minWidth: 150
        },
        { 
            field: "CONTACT_NUMBER", 
            headerName: "Contact", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 120 : 150,
            minWidth: 100
        },
        { 
            field: "DETAIL_ADDRESS", 
            headerName: "Address", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 200 : 300,
            minWidth: 150,
            hide: isMobile && !isFullScreen // Hide on mobile in windowed mode
        },
        { 
            field: "ADDRESS_TYPE", 
            headerName: "Type", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 100 : 130,
            minWidth: 80
        },
        { 
            field: "CONTACT_PERSON_NAME", 
            headerName: "Contact Person", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 140 : 180,
            minWidth: 120,
            hide: isMobile && !isFullScreen
        },
        { 
            field: "country", 
            headerName: "Country", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 100 : 120,
            minWidth: 80,
            hide: isMobile && !isFullScreen
        },
        { 
            field: "state", 
            headerName: "State", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 100 : 120,
            minWidth: 80,
            hide: isMobile && !isFullScreen
        },
        { 
            field: "city", 
            headerName: "City", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 100 : 120,
            minWidth: 80,
            hide: isMobile && !isFullScreen
        },
        { 
            field: "categoryName", 
            headerName: "Category", 
            filter: "agTextColumnFilter", 
            floatingFilter: true, 
            width: isMobile ? 120 : 150,
            minWidth: 100,
            hide: isMobile && !isFullScreen
        }
    ], [isMobile, isFullScreen]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile, // Disable floating filters on mobile
        resizable: true,
        suppressMenu: isMobile, // Disable column menu on mobile
        flex: isMobile ? 1 : 0 // Use flex sizing on mobile
    }), [isMobile]);

    useEffect(() => {
        fetch("http://localhost/surya_apis/company_list.php")
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success" && Array.isArray(data.data)) {
                    const formattedData = data.data.map(row => {
                        return Object.fromEntries(
                            Object.entries(row).map(([key, value]) => [key, value === null ? "" : value])
                        );
                    });
                    setRowData(formattedData);
                }
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    // Apply theme to document body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.style.backgroundColor = '#121212';
            document.body.style.color = '#f8f9fa';
        } else {
            document.body.style.backgroundColor = '#f0f2f5';
            document.body.style.color = '#212529';
        }
        
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
        };
    }, [theme]);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        if (selectedNodes.length === 1) {
            const customerId = selectedNodes[0].data.CUSTOMER_ID;
            navigate(`/edit-company/${customerId}`);
        }
    };

    // Grid utility functions
    const downloadExcel = () => {
        if (!gridRef.current) return;
        
        const api = gridRef.current.api;
        
        const params = {
            fileName: `${formTitle}_${new Date().toISOString().split('T')[0]}.csv`,
            allColumns: true,
            onlySelected: false,
            suppressQuotes: false,
            columnSeparator: ','
        };
        
        api.exportDataAsCsv(params);
    };

    const downloadActualExcel = () => {
        if (!gridRef.current) return;
        
        const api = gridRef.current.api;
        const allData = [];
        
        api.forEachNode((node) => {
            const rowData = {};
            columnDefs.forEach(colDef => {
                if (colDef.field && colDef.field !== 'serialNumber') {
                    rowData[colDef.headerName] = node.data[colDef.field] || '';
                } else if (colDef.field === 'serialNumber') {
                    rowData[colDef.headerName] = node.rowIndex + 1;
                }
            });
            allData.push(rowData);
        });

        let csvContent = '';
        
        const headers = columnDefs.map(col => col.headerName).join(',');
        csvContent += headers + '\n';
        
        allData.forEach(row => {
            const values = columnDefs.map(col => {
                const value = row[col.headerName] || '';
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            }).join(',');
            csvContent += values + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${formTitle}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearPinned = () => {
        if (!gridRef.current?.api) return;
        const api = gridRef.current.api;
        
        const allColumns = api.getColumnDefs() || [];
        allColumns.forEach((colDef) => {
            if (colDef.field && !['serialNumber', 'CUSTOMER_NAME'].includes(colDef.field)) {
                api.applyColumnState({
                    state: [{ colId: colDef.field, pinned: null }],
                    applyOrder: true
                });
            }
        });
    };

    const pinColumn = (colId, side = 'left') => {
        if (!gridRef.current?.api) return;
        const api = gridRef.current.api;
        
        api.applyColumnState({
            state: [{ colId: colId, pinned: side }],
            applyOrder: true
        });
    };

    const sizeToFit = () => {
        if (!gridRef.current?.api) return;
        const api = gridRef.current.api;
        api.sizeColumnsToFit();
    };

    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        const api = gridRef.current.api;
        
        const allColumnIds = api.getColumnDefs()?.map(colDef => colDef.field).filter(Boolean) || [];
        
        if (allColumnIds.length > 0) {
            api.autoSizeColumns(allColumnIds, false);
        }
    };

    const autoSizeAllSkipHeader = () => {
        if (!gridRef.current?.api) return;
        const api = gridRef.current.api;
        
        const allColumnIds = api.getColumnDefs()?.map(colDef => colDef.field).filter(Boolean) || [];
        
        if (allColumnIds.length > 0) {
            api.autoSizeColumns(allColumnIds, true);
        }
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#121212',
                color: '#f8f9fa',
                cardBg: '#212529',
                cardHeader: '#343a40',
                buttonVariant: 'outline-light',
                textClass: 'text-light',
                borderClass: 'border-secondary'
            };
        }
        return {
            backgroundColor: '#f0f2f5',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: '#007bff',
            buttonVariant: 'outline-dark',
            textClass: 'text-dark',
            borderClass: 'border-light'
        };
    };

    const themeStyles = getThemeStyles();

    // Dynamic height calculation
    const getGridHeight = () => {
        if (isFullScreen) {
            return isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 140px)';
        }
        return isMobile ? '400px' : '600px';
    };

    const gridHeight = getGridHeight();

    // Container styles for full screen
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

    return (
        <div 
            style={{ 
                minHeight: '100vh',
                backgroundColor: themeStyles.backgroundColor,
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
                            backgroundColor: themeStyles.cardHeader,
                            color: '#ffffff',
                            fontFamily: "'Maven Pro', sans-serif",
                            padding: isMobile ? '10px 15px' : '15px 20px',
                            flexShrink: 0
                        }}
                    >
                        <Row className="align-items-center g-2">
                            <Col xs={12} lg={4} className="mb-2 mb-lg-0">
                                <h4 className={`mb-0 text-white ${isMobile ? 'fs-6' : ''}`}>
                                    {isMobile ? formTitle.substring(0, 20) + (formTitle.length > 20 ? '...' : '') : formTitle}
                                </h4>
                            </Col>
                            <Col xs={12} lg={8}>
                                <div className="d-flex justify-content-end gap-1 flex-wrap">
                                    {/* Mobile: Show only essential buttons */}
                                    {isMobile ? (
                                        <>
                                            <Button 
                                                variant="success" 
                                                size="sm"
                                                onClick={downloadExcel}
                                                title="Download CSV"
                                            >
                                                <i className="bi bi-download"></i>
                                            </Button>
                                            
                                            <Button
                                                variant={isFullScreen ? 'outline-light' : 'outline-primary'}
                                                size="sm"
                                                onClick={toggleFullScreen}
                                                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                            >
                                                <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            </Button>
                                            
                                            <Button
                                                variant={theme === 'light' ? 'outline-light' : 'outline-info'}
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
                                            <ButtonGroup size="sm">
                                                <Button 
                                                    variant="success" 
                                                    onClick={downloadExcel}
                                                    title="Download CSV (Built-in)"
                                                >
                                                    <i className="bi bi-file-earmark-excel"></i> CSV
                                                </Button>
                                                
                                                <Button 
                                                    variant="outline-success" 
                                                    onClick={downloadActualExcel}
                                                    title="Download CSV (Custom)"
                                                >
                                                    <i className="bi bi-download"></i>
                                                </Button>
                                                
                                                <Dropdown as={ButtonGroup}>
                                                    <Button variant="info" onClick={sizeToFit} title="Size to Fit">
                                                        <i className="bi bi-arrows-angle-contract"></i> Fit
                                                    </Button>
                                                    <Dropdown.Toggle split variant="info" />
                                                    <Dropdown.Menu style={{ backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff' }}>
                                                        <Dropdown.Item 
                                                            onClick={autoSizeAll}
                                                            style={{ color: theme === 'dark' ? '#f8f9fa' : '#212529' }}
                                                        >
                                                            <i className="bi bi-arrows-expand"></i> Auto-size All
                                                        </Dropdown.Item>
                                                        <Dropdown.Item 
                                                            onClick={autoSizeAllSkipHeader}
                                                            style={{ color: theme === 'dark' ? '#f8f9fa' : '#212529' }}
                                                        >
                                                            <i className="bi bi-arrows-expand"></i> Auto-size (Skip Header)
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>

                                                <Dropdown as={ButtonGroup}>
                                                    <Button variant="warning" onClick={clearPinned} title="Clear Pinned">
                                                        <i className="bi bi-pin-angle"></i> Unpin
                                                    </Button>
                                                    <Dropdown.Toggle split variant="warning" />
                                                    <Dropdown.Menu style={{ backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff' }}>
                                                        <Dropdown.Item 
                                                            onClick={() => pinColumn('EMAIL', 'left')}
                                                            style={{ color: theme === 'dark' ? '#f8f9fa' : '#212529' }}
                                                        >
                                                            <i className="bi bi-pin-angle-fill"></i> Pin Email
                                                        </Dropdown.Item>
                                                        <Dropdown.Item 
                                                            onClick={() => pinColumn('CONTACT_NUMBER', 'right')}
                                                            style={{ color: theme === 'dark' ? '#f8f9fa' : '#212529' }}
                                                        >
                                                            <i className="bi bi-pin-angle-fill"></i> Pin Contact (Right)
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </ButtonGroup>

                                            <ButtonGroup size="sm">
                                                <Button
                                                    variant={isFullScreen ? 'outline-light' : 'outline-primary'}
                                                    onClick={toggleFullScreen}
                                                    title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                                >
                                                    <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                                    {isFullScreen ? ' Exit' : ' Full'}
                                                </Button>
                                                
                                                <Button
                                                    variant={theme === 'light' ? 'outline-light' : 'outline-info'}
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
                        <div 
                            className="ag-theme-alpine" 
                            style={{ 
                                height: gridHeight, 
                                width: "100%",
                                // Custom CSS properties for dark theme
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
                                    '--ag-selected-row-background-color': '#0d6efd',
                                    '--ag-range-selection-background-color': '#0d6efd33',
                                    '--ag-cell-horizontal-border': '#343a40',
                                    '--ag-header-cell-hover-background-color': '#495057',
                                    '--ag-header-cell-moving-background-color': '#495057',
                                    '--ag-value-change-value-highlight-background-color': '#198754',
                                    '--ag-chip-background-color': '#495057',
                                    '--ag-input-background-color': '#343a40',
                                    '--ag-input-border-color': '#495057',
                                    '--ag-input-focus-border-color': '#0d6efd',
                                    '--ag-minichart-selected-chart-color': '#0d6efd',
                                    '--ag-minichart-selected-page-color': '#0d6efd',
                                    '--ag-pinned-left-border': '2px solid #495057',
                                    '--ag-pinned-right-border': '2px solid #495057'
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
                                rowSelection="single"
                                onSelectionChanged={onSelectionChanged}
                                suppressMovableColumns={isMobile}
                                enableRangeSelection={!isMobile}
                                enableCharts={!isMobile}
                                enableAdvancedFilter={!isMobile}
                                rowMultiSelectWithClick={false}
                                suppressRowClickSelection={false}
                                animateRows={!isMobile}
                                enableCellTextSelection={true}
                                suppressHorizontalScroll={false}
                                suppressColumnVirtualisation={isMobile}
                                rowBuffer={isMobile ? 5 : 10}
                                // Mobile specific optimizations
                                headerHeight={isMobile ? 40 : 48}
                                rowHeight={isMobile ? 35 : 42}
                                suppressMenuHide={isMobile}
                                suppressContextMenu={isMobile}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default GridExample;