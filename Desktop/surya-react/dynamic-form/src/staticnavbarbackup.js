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

  // Some bootstrap icon names to cycle through
  const iconList = [
    'house', 'gear', 'folder', 'file-earmark', 'calendar', 'chat-left-text', 'graph-up', 'people', 'clipboard-check', 'collection'
  ];

  // Get icon based on index
  const getIcon = (index) => iconList[index % iconList.length];

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
    return menu.map((item, index) => {
      const menuItem = {
        id: item.id,
        name: item.name,
        icon: getIcon(index),
        route: `/${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        children: []
      };

      if (item.sub_menu?.length) {
        menuItem.children = item.sub_menu.map((subItem, subIndex) => {
          const subMenuItem = {
            id: subItem.id,
            name: subItem.name,
            icon: getIcon(subIndex + index + 1),
            route: `/${item.name.toLowerCase().replace(/\s+/g, '-')}/${subItem.name.toLowerCase().replace(/\s+/g, '-')}`,
            children: []
          };

          if (subItem.sub_sub_menu?.length) {
            subMenuItem.children = subItem.sub_sub_menu.map((subSubItem, ssi) => {
              const subSubMenuItem = {
                id: subSubItem.id,
                name: subSubItem.name,
                icon: getIcon(ssi + subIndex + index + 2),
                route: `/${item.name.toLowerCase().replace(/\s+/g, '-')}/${subItem.name.toLowerCase().replace(/\s+/g, '-')}/${subSubItem.name.toLowerCase().replace(/\s+/g, '-')}`,
                children: []
              };

              if (subSubItem.sub_sub_sub_menu?.length) {
                subSubMenuItem.children = subSubItem.sub_sub_sub_menu.map((subSubSubItem, sssi) => ({
                  id: subSubSubItem.id,
                  name: subSubSubItem.name,
                  icon: getIcon(sssi + ssi + subIndex + index),
                  route: `/${item.name.toLowerCase().replace(/\s+/g, '-')}/${subItem.name.toLowerCase().replace(/\s+/g, '-')}/${subSubItem.name.toLowerCase().replace(/\s+/g, '-')}/${subSubSubItem.name.toLowerCase().replace(/\s+/g, '-')}`
                }));
              }

              return subSubMenuItem;
            });
          }

          return subMenuItem;
        });
      }

      return menuItem;
    });
  };

  const renderMenuItems = (items, level = 0) => {
    return items.map((item, idx) => {
      const icon = item.icon ? <i className={`bi bi-${item.icon} me-2`}></i> : null;

      if (item.children?.length > 0) {
        return (
          <NavDropdown title={<span>{icon}{item.name}</span>} id={`nav-dropdown-${item.id}`} key={item.id} className="px-2">
            {renderMenuItems(item.children, level + 1)}
          </NavDropdown>
        );
      } else if (item.type === 'divider') {
        return <NavDropdown.Divider key={item.id} />;
      } else {
        if (level > 0) {
          return (
            <NavDropdown.Item as={Link} to={item.route} key={item.id}>
              {icon}{item.name}
            </NavDropdown.Item>
          );
        }
        return (
          <Nav.Link as={Link} to={item.route} className="px-3" key={item.id}>
            {icon}{item.name}
          </Nav.Link>
        );
      }
    });
  };

  return (
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
          <span className="ms-1 text-primary d-none d-sm-inline" style={{ fontWeight: '500' }}>AI</span>
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
            <Nav.Link href="#" className="position-relative me-3">
              <i className="bi bi-bell fs-5"></i>
              {notifications > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                  {notifications}
                </Badge>
              )}
            </Nav.Link>
            <NavDropdown
              title={<span><i className="bi bi-person-circle me-1"></i> User</span>}
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
