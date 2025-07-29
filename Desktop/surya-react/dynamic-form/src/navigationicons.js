import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navigation({ theme, toggleTheme, themeStyles }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications] = useState(0);

  const fullScreenStyles = {
    navbarStyle: {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  };

  // Simplified and clean icon mapping
  const getIconForMenuItem = (name, level = 0) => {
    const lowerName = name.toLowerCase();
    
    // Main menu icons - simple and clean
    if (level === 0) {
      if (lowerName.includes('dashboard') || lowerName.includes('home')) return 'house';
      if (lowerName.includes('user') || lowerName.includes('profile') || lowerName.includes('account')) return 'person';
      if (lowerName.includes('setting') || lowerName.includes('config')) return 'gear';
      if (lowerName.includes('report') || lowerName.includes('analytics')) return 'bar-chart';
      if (lowerName.includes('product') || lowerName.includes('inventory')) return 'box';
      if (lowerName.includes('order') || lowerName.includes('purchase')) return 'cart';
      if (lowerName.includes('customer') || lowerName.includes('client')) return 'people';
      if (lowerName.includes('finance') || lowerName.includes('payment') || lowerName.includes('money')) return 'credit-card';
      if (lowerName.includes('message') || lowerName.includes('chat')) return 'chat';
      if (lowerName.includes('notification') || lowerName.includes('alert')) return 'bell';
      if (lowerName.includes('help') || lowerName.includes('support')) return 'question-circle';
      if (lowerName.includes('document') || lowerName.includes('file')) return 'file-text';
      if (lowerName.includes('calendar') || lowerName.includes('schedule')) return 'calendar';
      if (lowerName.includes('task') || lowerName.includes('project')) return 'check-square';
      if (lowerName.includes('contact')) return 'telephone';
      if (lowerName.includes('email') || lowerName.includes('mail')) return 'envelope';
      if (lowerName.includes('security') || lowerName.includes('lock')) return 'shield';
      if (lowerName.includes('admin') || lowerName.includes('manage')) return 'tools';
      if (lowerName.includes('sales') || lowerName.includes('revenue')) return 'graph-up';
      if (lowerName.includes('marketing') || lowerName.includes('promotion')) return 'megaphone';
      if (lowerName.includes('hr') || lowerName.includes('employee')) return 'person-workspace';
      if (lowerName.includes('warehouse') || lowerName.includes('stock')) return 'building';
      if (lowerName.includes('delivery') || lowerName.includes('shipping')) return 'truck';
      if (lowerName.includes('supplier') || lowerName.includes('vendor')) return 'briefcase';
      return 'folder';
    }
    
    // Sub-menu icons - minimal and clean
    if (level === 1) {
      if (lowerName.includes('add') || lowerName.includes('create') || lowerName.includes('new')) return 'plus';
      if (lowerName.includes('list') || lowerName.includes('view') || lowerName.includes('all')) return 'list';
      if (lowerName.includes('edit') || lowerName.includes('update') || lowerName.includes('modify')) return 'pencil';
      if (lowerName.includes('delete') || lowerName.includes('remove')) return 'trash';
      if (lowerName.includes('search') || lowerName.includes('find')) return 'search';
      if (lowerName.includes('import') || lowerName.includes('upload')) return 'upload';
      if (lowerName.includes('export') || lowerName.includes('download')) return 'download';
      if (lowerName.includes('print')) return 'printer';
      if (lowerName.includes('copy') || lowerName.includes('duplicate')) return 'files';
      if (lowerName.includes('archive')) return 'archive';
      if (lowerName.includes('history') || lowerName.includes('log')) return 'clock';
      if (lowerName.includes('backup')) return 'cloud-arrow-up';
      if (lowerName.includes('restore')) return 'cloud-arrow-down';
      if (lowerName.includes('approve') || lowerName.includes('accept')) return 'check';
      if (lowerName.includes('reject') || lowerName.includes('decline')) return 'x';
      if (lowerName.includes('pending') || lowerName.includes('waiting')) return 'hourglass';
      if (lowerName.includes('assign') || lowerName.includes('allocate')) return 'person-plus';
      if (lowerName.includes('track') || lowerName.includes('monitor')) return 'eye';
      return 'arrow-right';
    }
    
    // Sub-sub-menu icons - simple dots and basic icons
    if (level === 2) {
      if (lowerName.includes('detail') || lowerName.includes('info')) return 'info';
      if (lowerName.includes('status') || lowerName.includes('state')) return 'check-circle';
      if (lowerName.includes('category') || lowerName.includes('type')) return 'tag';
      if (lowerName.includes('permission') || lowerName.includes('access')) return 'key';
      if (lowerName.includes('template')) return 'layout-text-window';
      if (lowerName.includes('config') || lowerName.includes('setting')) return 'sliders';
      return 'dot';
    }
    
    // Deep sub-menu icons
    return 'chevron-right';
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://localhost/surya_apis/dynamic_navbar.php/user');
        if (response.data.status === 'success' && response.data.menu) {
          const transformedMenu = transformMenuStructure(response.data.menu);
          setMenuItems(transformedMenu);
        }
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load menu items');
        setIsLoading(false);
        console.error('Error fetching menu items:', err);
      }
    };
    fetchMenuItems();
  }, []);

  const transformMenuStructure = (menu) => {
    const transformed = [];

    menu.forEach(item => {
      const menuItem = {
        id: item.id,
        name: item.name,
        route: `/${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        icon: getIconForMenuItem(item.name, 0),
        children: []
      };

      if (item.sub_menu && item.sub_menu.length > 0) {
        item.sub_menu.forEach(subItem => {
          if (subItem.name?.trim() !== '') {
            const subMenuItem = {
              id: subItem.id,
              name: subItem.name,
              route: `/${item.name.toLowerCase().replace(/\s+/g, '-')}/${subItem.name.toLowerCase().replace(/\s+/g, '-')}`,
              icon: getIconForMenuItem(subItem.name, 1),
              children: []
            };

            if (subItem.sub_sub_menu && subItem.sub_sub_menu.length > 0) {
              subItem.sub_sub_menu.forEach(subSubItem => {
                if (subSubItem.name?.trim() !== '') {
                  const subSubMenuItem = {
                    id: subSubItem.id,
                    name: subSubItem.name,
                    route: `/${item.name.toLowerCase().replace(/\s+/g, '-')}/${subItem.name.toLowerCase().replace(/\s+/g, '-')}/${subSubItem.name.toLowerCase().replace(/\s+/g, '-')}`,
                    icon: getIconForMenuItem(subSubItem.name, 2),
                    children: []
                  };

                  if (subSubItem.sub_sub_sub_menu && subSubItem.sub_sub_sub_menu.length > 0) {
                    subSubItem.sub_sub_sub_menu.forEach(subSubSubItem => {
                      if (subSubSubItem.name?.trim() !== '') {
                        subSubMenuItem.children.push({
                          id: subSubSubItem.id,
                          name: subSubSubItem.name,
                          route: `/${item.name.toLowerCase().replace(/\s+/g, '-')}/${subItem.name.toLowerCase().replace(/\s+/g, '-')}/${subSubItem.name.toLowerCase().replace(/\s+/g, '-')}/${subSubSubItem.name.toLowerCase().replace(/\s+/g, '-')}`,
                          icon: getIconForMenuItem(subSubSubItem.name, 3)
                        });
                      }
                    });
                  }

                  subMenuItem.children.push(subSubMenuItem);
                }
              });
            }

            menuItem.children.push(subMenuItem);
          }
        });
      }

      transformed.push(menuItem);
    });

    return transformed;
  };

  const renderMenuItems = (items, level = 0) => {
    return items.map((item) => {
      if (item.children?.length > 0) {
        return (
          <NavDropdown 
            title={
              <span className="d-flex align-items-center">
                <i className={`bi bi-${item.icon} me-2`} style={{ fontSize: '14px' }}></i>
                <span>{item.name}</span>
                <i className="bi bi-chevron-down ms-1" style={{ fontSize: '10px', opacity: 0.7 }}></i>
              </span>
            } 
            id={`nav-dropdown-${item.id}`} 
            key={item.id} 
            className="nav-dropdown-custom"
            align="end"
            style={{
              '--bs-dropdown-min-width': '220px',
              '--bs-dropdown-border-radius': '8px',
              '--bs-dropdown-box-shadow': '0 4px 20px rgba(0,0,0,0.1)',
              '--bs-dropdown-border': '1px solid rgba(0,0,0,0.08)'
            }}
          >
            {renderMenuItems(item.children, level + 1)}
          </NavDropdown>
        );
      } else if (item.type === 'divider') {
        return <NavDropdown.Divider key={item.id} />;
      } else {
        const handleClick = (e) => {
          if (item.onClick) {
            e.preventDefault();
            navigate(item.route);
          }
        };

        if (level > 0) {
          return (
            <NavDropdown.Item
              as={Link}
              to={item.route}
              key={item.id}
              onClick={item.onClick ? handleClick : undefined}
              className="dropdown-item-custom"
            >
              <i className={`bi bi-${item.icon} me-2`} style={{ fontSize: '13px', opacity: 0.8 }}></i>
              <span>{item.name}</span>
            </NavDropdown.Item>
          );
        }

        return (
          <Nav.Link
            as={Link}
            to={item.route}
            className="nav-link-custom"
            key={item.id}
          >
            <i className={`bi bi-${item.icon} me-2`} style={{ fontSize: '14px' }}></i>
            <span>{item.name}</span>
          </Nav.Link>
        );
      }
    });
  };

  return (
    <>
      <style>
        {`
          /* Navigation Animation Styles */
          .nav-link-custom {
            position: relative;
            padding: 8px 16px !important;
            margin: 0 4px;
            border-radius: 6px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: inherit;
            text-decoration: none;
            display: flex;
            align-items: center;
          }
          
          .nav-link-custom:hover {
            background-color: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
          }
          
          .nav-link-custom.active {
            background-color: #0d6efd;
            color: white;
            box-shadow: 0 3px 12px rgba(13, 110, 253, 0.3);
          }
          
          .nav-dropdown-custom .dropdown-toggle::after {
            display: none;
          }
          
          .nav-dropdown-custom .dropdown-toggle {
            padding: 8px 16px !important;
            margin: 0 4px;
            border-radius: 6px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            background: transparent;
          }
          
          .nav-dropdown-custom .dropdown-toggle:hover {
            background-color: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
          }
          
          .nav-dropdown-custom .dropdown-menu {
            border: 1px solid rgba(0,0,0,0.08);
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            padding: 8px;
            margin-top: 4px;
            animation: dropdownFadeIn 0.2s ease-out;
          }
          
          @keyframes dropdownFadeIn {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .dropdown-item-custom {
            padding: 8px 12px !important;
            margin: 2px 0;
            border-radius: 5px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            color: #495057;
            text-decoration: none;
          }
          
          .dropdown-item-custom:hover {
            background-color: rgba(13, 110, 253, 0.08);
            color: #0d6efd;
            transform: translateX(3px);
          }
          
          .dropdown-item-custom:focus {
            background-color: rgba(13, 110, 253, 0.08);
            color: #0d6efd;
          }
          
          /* Notification bell animation */
          .notification-bell {
            position: relative;
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.3s ease;
          }
          
          .notification-bell:hover {
            background-color: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
            transform: scale(1.05);
          }
          
          .notification-bell i {
            animation: bellRing 2s infinite;
          }
          
          @keyframes bellRing {
            0%, 50%, 100% { transform: rotate(0deg); }
            10%, 30% { transform: rotate(-10deg); }
            20% { transform: rotate(10deg); }
          }
          
          /* User dropdown styles */
          .user-dropdown .dropdown-toggle {
            padding: 6px 12px !important;
            border-radius: 6px;
            transition: all 0.3s ease;
            border: none;
            background: transparent;
          }
          
          .user-dropdown .dropdown-toggle:hover {
            background-color: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
            transform: scale(1.02);
          }
          
          /* Navbar brand animation */
          .navbar-brand {
            transition: all 0.3s ease;
          }
          
          .navbar-brand:hover {
            transform: scale(1.02);
          }
          
          /* Smooth navbar collapse */
          .navbar-collapse {
            transition: all 0.3s ease;
          }
          
          /* Mobile responsive improvements */
          @media (max-width: 991.98px) {
            .nav-link-custom, .nav-dropdown-custom .dropdown-toggle {
              margin: 2px 0;
              padding: 10px 16px !important;
            }
            
            .dropdown-item-custom:hover {
              transform: none;
            }
          }
        `}
      </style>
      <Navbar
        expand="lg"
        bg={themeStyles?.navBg || 'light'}
        variant={theme === 'dark' ? 'dark' : 'light'}
        className="py-2"
        style={fullScreenStyles.navbarStyle}
      >
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center">
            <i className="bi bi-clipboard-check me-2 fs-4"></i>
            <span className="ms-1 text-primary d-none d-sm-inline" style={{ fontWeight: '500' }}>SURYA</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="w-100">
            <Nav className="me-auto flex-wrap">
              {isLoading ? (
                <Nav.Link disabled>Loading menu...</Nav.Link>
              ) : error ? (
                <Nav.Link className="text-danger">{error}</Nav.Link>
              ) : (
                renderMenuItems(menuItems)
              )}
            </Nav>
            <Nav className="flex-wrap justify-content-end">
              <Nav.Link href="#" className="notification-bell me-2">
                <i className="bi bi-bell fs-5"></i>
                {notifications > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                    {notifications}
                  </Badge>
                )}
              </Nav.Link>
              <NavDropdown
                title={
                  <span className="d-flex align-items-center">
                    <i className="bi bi-person-circle me-2 fs-5"></i>
                    <span>User</span>
                  </span>
                }
                id="user-dropdown"
                align="end"
                className="user-dropdown"
                style={{
                  '--bs-dropdown-min-width': '180px',
                  '--bs-dropdown-border-radius': '8px',
                  '--bs-dropdown-box-shadow': '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                <NavDropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                  <i className="bi bi-person me-2" style={{ fontSize: '13px', opacity: 0.8 }}></i>
                  <span>Profile</span>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/logout" className="dropdown-item-custom">
                  <i className="bi bi-box-arrow-right me-2" style={{ fontSize: '13px', opacity: 0.8 }}></i>
                  <span>Logout</span>
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Navigation;