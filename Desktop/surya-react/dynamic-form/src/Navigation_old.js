import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Container, Nav, Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navigation({ theme, toggleTheme, themeStyles }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications] = useState(3);
  const [activeDropdowns, setActiveDropdowns] = useState(new Set());
  const [dropdownPositions, setDropdownPositions] = useState({});
  const scrollRef = useRef(null);
  const navbarRef = useRef(null);

  const fullScreenStyles = {
    navbarStyle: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderBottom: '1px solid rgba(0,0,0,0.05)'
    }
  };

  // Enhanced icon mapping with better categorization
  const getIconForMenuItem = (name, level = 0) => {
    const lowerName = name.toLowerCase();
    
    if (level === 0) {
      if (lowerName.includes('dashboard') || lowerName.includes('home')) return 'house-door';
      if (lowerName.includes('user') || lowerName.includes('profile') || lowerName.includes('account')) return 'person-circle';
      if (lowerName.includes('setting') || lowerName.includes('config')) return 'gear';
      if (lowerName.includes('report') || lowerName.includes('analytics')) return 'bar-chart-line';
      if (lowerName.includes('product') || lowerName.includes('inventory')) return 'box-seam';
      if (lowerName.includes('order') || lowerName.includes('purchase')) return 'cart3';
      if (lowerName.includes('customer') || lowerName.includes('client')) return 'people';
      if (lowerName.includes('finance') || lowerName.includes('payment') || lowerName.includes('money')) return 'credit-card';
      if (lowerName.includes('message') || lowerName.includes('chat')) return 'chat-dots';
      if (lowerName.includes('notification') || lowerName.includes('alert')) return 'bell';
      if (lowerName.includes('help') || lowerName.includes('support')) return 'question-circle';
      if (lowerName.includes('document') || lowerName.includes('file')) return 'file-earmark-text';
      if (lowerName.includes('calendar') || lowerName.includes('schedule')) return 'calendar3';
      if (lowerName.includes('task') || lowerName.includes('project')) return 'check2-square';
      if (lowerName.includes('contact')) return 'telephone';
      if (lowerName.includes('email') || lowerName.includes('mail')) return 'envelope';
      if (lowerName.includes('security') || lowerName.includes('lock')) return 'shield-check';
      if (lowerName.includes('admin') || lowerName.includes('manage')) return 'tools';
      if (lowerName.includes('sales') || lowerName.includes('revenue')) return 'graph-up';
      if (lowerName.includes('marketing') || lowerName.includes('promotion')) return 'megaphone';
      if (lowerName.includes('hr') || lowerName.includes('employee')) return 'person-workspace';
      if (lowerName.includes('warehouse') || lowerName.includes('stock')) return 'building';
      if (lowerName.includes('delivery') || lowerName.includes('shipping')) return 'truck';
      if (lowerName.includes('supplier') || lowerName.includes('vendor')) return 'briefcase';
      return 'folder2-open';
    }
    
    if (level === 1) {
      if (lowerName.includes('add') || lowerName.includes('create') || lowerName.includes('new')) return 'plus-circle';
      if (lowerName.includes('list') || lowerName.includes('view') || lowerName.includes('all')) return 'list-ul';
      if (lowerName.includes('edit') || lowerName.includes('update') || lowerName.includes('modify')) return 'pencil-square';
      if (lowerName.includes('delete') || lowerName.includes('remove')) return 'trash3';
      if (lowerName.includes('search') || lowerName.includes('find')) return 'search';
      if (lowerName.includes('import') || lowerName.includes('upload')) return 'cloud-upload';
      if (lowerName.includes('export') || lowerName.includes('download')) return 'cloud-download';
      if (lowerName.includes('print')) return 'printer';
      if (lowerName.includes('copy') || lowerName.includes('duplicate')) return 'files';
      if (lowerName.includes('archive')) return 'archive';
      if (lowerName.includes('history') || lowerName.includes('log')) return 'clock-history';
      return 'arrow-right-circle';
    }
    
    if (level === 2) {
      if (lowerName.includes('detail') || lowerName.includes('info')) return 'info-circle';
      if (lowerName.includes('status') || lowerName.includes('state')) return 'check-circle';
      if (lowerName.includes('category') || lowerName.includes('type')) return 'tags';
      return 'dot';
    }
    
    return 'chevron-right';
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // Mock data for demonstration - replace with your API call
        const mockResponse = {
          data: {
            status: 'success',
            menu: [
              {
                id: 1,
                name: 'Dashboard',
                sub_menu: []
              },
              {
                id: 2,
                name: 'Products',
                sub_menu: [
                  {
                    id: 21,
                    name: 'Add Product',
                    sub_sub_menu: []
                  },
                  {
                    id: 22,
                    name: 'Manage Products',
                    sub_sub_menu: [
                      {
                        id: 221,
                        name: 'Categories',
                        sub_sub_sub_menu: [
                          { id: 2211, name: 'Electronics' },
                          { id: 2212, name: 'Clothing' }
                        ]
                      },
                      {
                        id: 222,
                        name: 'Inventory',
                        sub_sub_sub_menu: []
                      }
                    ]
                  }
                ]
              },
              {
                id: 3,
                name: 'Orders',
                sub_menu: [
                  {
                    id: 31,
                    name: 'New Orders',
                    sub_sub_menu: []
                  },
                  {
                    id: 32,
                    name: 'Order History',
                    sub_sub_menu: []
                  }
                ]
              },
              {
                id: 4,
                name: 'Customers',
                sub_menu: []
              },
              {
                id: 5,
                name: 'Reports',
                sub_menu: [
                  {
                    id: 51,
                    name: 'Sales Reports',
                    sub_sub_menu: [
                      {
                        id: 511,
                        name: 'Monthly Sales',
                        sub_sub_sub_menu: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        };

        // Uncomment below for actual API caaxiosll
        const response = await axios.get('http://93.127.167.54/Surya_React/surya_dynamic_api/dynamic_navbar.php/user');
        console.log("error272727",response);
        // const userId = localStorage.getItem('user_id');
        // // alert(userId);
        // const response = await axios.get(`http://localhost/surya_apis/dynamic_navbar.php?user_id=${userId}`, {
        //   headers: { 'Content-Type': 'application/json' }
        // });
        // const response = mockResponse;
        
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

  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const calculateDropdownPosition = (buttonElement, level = 0) => {
    if (!buttonElement || !navbarRef.current) return {};
    
    const buttonRect = buttonElement.getBoundingClientRect();
    const navbarRect = navbarRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let top = buttonRect.bottom + 8;
    let left = level === 0 ? buttonRect.left : buttonRect.right + 8;
    
    // Adjust if dropdown would go off screen
    if (level === 0) {
      if (left + 220 > viewportWidth) {
        left = buttonRect.right - 220;
      }
    } else {
      if (left + 200 > viewportWidth) {
        left = buttonRect.left - 200 - 8;
      }
    }
    
    if (top + 300 > viewportHeight) {
      top = buttonRect.top - 8;
    }
    
    return {
      position: 'fixed',
      top: `${Math.max(top, 10)}px`,
      left: `${Math.max(left, 10)}px`,
      zIndex: 2000 + level
    };
  };

  const handleDropdownClick = (itemId, buttonRef, level = 0, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const newActiveDropdowns = new Set(activeDropdowns);
    
    if (newActiveDropdowns.has(itemId)) {
      // Close this dropdown and all its children
      const dropdownsToClose = Array.from(newActiveDropdowns).filter(id => 
        id.startsWith(itemId) || id === itemId
      );
      dropdownsToClose.forEach(id => newActiveDropdowns.delete(id));
    } else {
      // Close dropdowns at the same level or deeper
      const currentLevel = itemId.toString().split('-').length - 1;
      Array.from(newActiveDropdowns).forEach(id => {
        const idLevel = id.toString().split('-').length - 1;
        if (idLevel >= currentLevel) {
          newActiveDropdowns.delete(id);
        }
      });
      
      // Open this dropdown
      newActiveDropdowns.add(itemId);
      
      if (buttonRef) {
        const position = calculateDropdownPosition(buttonRef, level);
        setDropdownPositions(prev => ({ ...prev, [itemId]: position }));
      }
    }
    
    setActiveDropdowns(newActiveDropdowns);
  };

  const closeAllDropdowns = () => {
    setActiveDropdowns(new Set());
    setDropdownPositions({});
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-dropdown-container') && 
          !event.target.closest('.dropdown-portal') &&
          !event.target.closest('.submenu-dropdown-portal')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const renderSubMenu = (children, level = 1, parentId = '') => {
    return children.map((child) => (
      <div key={child.id} className="submenu-item">
        {child.children && child.children.length > 0 ? (
          <div className="submenu-parent">
            <button
              className="dropdown-item-modern submenu-button w-100 text-start"
              onClick={(e) => {
                const subMenuId = `${parentId}-${child.id}`;
                handleDropdownClick(subMenuId, e.currentTarget, level, e);
              }}
            >
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="d-flex align-items-center">
                  <i className={`bi bi-${child.icon} me-2`} style={{ fontSize: '13px', opacity: 0.8 }}></i>
                  <span>{child.name}</span>
                </div>
                <i className={`bi bi-chevron-${activeDropdowns.has(`${parentId}-${child.id}`) ? 'down' : 'right'} ms-2`} 
                   style={{ fontSize: '10px', opacity: 0.6 }}></i>
              </div>
            </button>
            
            {/* Submenu Portal */}
            {activeDropdowns.has(`${parentId}-${child.id}`) && (
              <div 
                className="submenu-dropdown-portal"
                style={dropdownPositions[`${parentId}-${child.id}`] || {}}
              >
                {renderSubMenu(child.children, level + 1, `${parentId}-${child.id}`)}
              </div>
            )}
          </div>
        ) : (
          <Link
            to={child.route}
            className="dropdown-item-modern"
            onClick={closeAllDropdowns}
          >
            <i className={`bi bi-${child.icon} me-2`} style={{ fontSize: '13px', opacity: 0.8 }}></i>
            <span>{child.name}</span>
          </Link>
        )}
      </div>
    ));
  };

  const renderMenuItems = () => {
    return menuItems.map((item) => {
      if (item.children?.length > 0) {
        return (
          <div 
            key={item.id} 
            className="menu-dropdown-container"
          >
            <button
              className="menu-item-toggle"
              onClick={(e) => {
                handleDropdownClick(item.id, e.currentTarget, 0, e);
              }}
            >
              <div className="d-flex align-items-center">
                <i className={`bi bi-${item.icon} me-2`} style={{ fontSize: '16px' }}></i>
                <span className="menu-text">{item.name}</span>
                <i className={`bi bi-chevron-${activeDropdowns.has(item.id) ? 'up' : 'down'} ms-1`} 
                   style={{ fontSize: '10px', opacity: 0.7 }}></i>
              </div>
            </button>

            {/* Main Dropdown Portal */}
            {activeDropdowns.has(item.id) && (
              <div 
                className="dropdown-portal"
                style={dropdownPositions[item.id] || {}}
              >
                {renderSubMenu(item.children, 1, item.id)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <Link
            key={item.id}
            to={item.route}
            className="menu-item-link"
            onClick={closeAllDropdowns}
          >
            <i className={`bi bi-${item.icon} me-2`} style={{ fontSize: '16px' }}></i>
            <span className="menu-text">{item.name}</span>
          </Link>
        );
      }
    });
  };

  return (
    <>
      <style>
        {`
          /* Modern Horizontal Navbar Styles */
          .horizontal-navbar {
            background: ${theme === 'dark' ? '#1a1d23' : '#ffffff'};
            border-bottom: 1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            position: sticky;
            top: 0;
            z-index: 1000;
          }

          .navbar-brand-modern {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: ${theme === 'dark' ? '#ffffff' : '#1a202c'};
            font-weight: 600;
            font-size: 20px;
            transition: all 0.3s ease;
          }

          .navbar-brand-modern:hover {
            color: #3182ce;
            transform: scale(1.02);
          }

          .scroll-container {
            position: relative;
            flex: 1;
            overflow: hidden;
            margin: 0 20px;
          }

          .scroll-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: ${theme === 'dark' ? '#2d3748' : '#f7fafc'};
            border: 1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .scroll-button:hover {
            background: ${theme === 'dark' ? '#4a5568' : '#edf2f7'};
            transform: translateY(-50%) scale(1.1);
          }

          .scroll-button-left {
            left: -5px;
          }

          .scroll-button-right {
            right: -5px;
          }

          .horizontal-menu {
            display: flex;
            align-items: center;
            overflow-x: auto;
            scroll-behavior: smooth;
            padding: 10px 0;
            gap: 8px;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .horizontal-menu::-webkit-scrollbar {
            display: none;
          }

          .menu-dropdown-container {
            position: relative;
          }

          .menu-item-link, .menu-item-toggle {
            background: transparent;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            text-decoration: none;
            color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
            white-space: nowrap;
            display: flex;
            align-items: center;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            cursor: pointer;
            min-width: fit-content;
          }

          .menu-item-link:hover, .menu-item-toggle:hover {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.1)'};
            color: #3182ce;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
          }

          .menu-item-link:focus, .menu-item-toggle:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
          }

          .menu-text {
            font-size: 14px;
            font-weight: 500;
          }

          /* Dropdown Portal Styles */
          .dropdown-portal, .submenu-dropdown-portal {
            background: ${theme === 'dark' ? '#1a1d23' : '#ffffff'};
            border: 1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1);
            padding: 8px;
            min-width: 220px;
            max-height: 400px;
            overflow-y: auto;
            animation: dropdownSlideIn 0.2s ease-out;
          }

          .submenu-dropdown-portal {
            min-width: 200px;
          }

          @keyframes dropdownSlideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .dropdown-item-modern {
            padding: 10px 14px;
            border-radius: 6px;
            margin: 2px 0;
            display: flex;
            align-items: center;
            color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
            text-decoration: none;
            transition: all 0.2s ease;
            font-size: 14px;
            border: none;
            background: transparent;
            width: 100%;
            text-align: left;
          }

          .dropdown-item-modern:hover {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.08)'};
            color: #3182ce;
            transform: translateX(4px);
          }

          .submenu-parent {
            position: relative;
          }

          .submenu-button {
            cursor: pointer;
          }

          .submenu-item {
            margin-bottom: 2px;
          }

          .user-section {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .notification-button {
            position: relative;
            background: transparent;
            border: none;
            padding: 8px;
            border-radius: 8px;
            color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .notification-button:hover {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.1)'};
            color: #3182ce;
            transform: scale(1.05);
          }

          .notification-bell {
            font-size: 20px;
          }

          .notification-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            background: #e53e3e;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
          }

          .user-dropdown {
            position: relative;
          }

          .user-toggle {
            background: transparent;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .user-toggle:hover {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.1)'};
            color: #3182ce;
          }

          .user-avatar {
            font-size: 24px;
            margin-right: 8px;
          }

          /* Active dropdown styling */
          .menu-item-toggle.active {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.2)' : 'rgba(66, 153, 225, 0.15)'};
            color: #3182ce;
          }

          .dropdown-item-modern.active {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.2)' : 'rgba(66, 153, 225, 0.15)'};
            color: #3182ce;
          }

          /* Responsive Design */
          @media (max-width: 992px) {
            .scroll-container {
              margin: 0 10px;
            }
            
            .menu-item-link, .menu-item-toggle {
              padding: 10px 16px;
            }
            
            .menu-text {
              font-size: 13px;
            }
            
            .dropdown-portal, .submenu-dropdown-portal {
              min-width: 200px;
            }
          }

          @media (max-width: 768px) {
            .horizontal-menu {
              gap: 4px;
            }
            
            .menu-item-link, .menu-item-toggle {
              padding: 8px 12px;
            }
            
            .scroll-button {
              width: 28px;
              height: 28px;
            }
            
            .dropdown-portal, .submenu-dropdown-portal {
              min-width: 180px;
              max-height: 300px;
            }
          }
        `}
      </style>

      <Navbar className="horizontal-navbar py-2" ref={navbarRef}>
        <Container fluid className="px-3">
          {/* Brand */}
          <Link to="/dashboard" className="navbar-brand-modern" onClick={closeAllDropdowns}>
            <i className="bi bi-clipboard-check me-2" style={{ fontSize: '24px', color: '#3182ce' }}></i>
            <span className="d-none d-sm-inline">SURYA</span>
          </Link>

          {/* Horizontal Scrolling Menu */}
          <div className="scroll-container">
            <button 
              className="scroll-button scroll-button-left"
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            <div className="horizontal-menu" ref={scrollRef}>
              {isLoading ? (
                <div className="menu-item-link">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Loading...
                </div>
              ) : error ? (
                <div className="menu-item-link text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              ) : (
                renderMenuItems()
              )}
            </div>
            
            <button 
              className="scroll-button scroll-button-right"
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>

          {/* User Section */}
          <div className="user-section">
            {/* Notifications */}
            <button className="notification-button" aria-label="Notifications">
              <i className="bi bi-bell notification-bell"></i>
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>

            {/* User Dropdown */}
           {/* User Dropdown */}
            <Dropdown className="user-dropdown" align="end">
              <Dropdown.Toggle 
                as="button" 
                className="user-toggle"
                id="user-dropdown"
              >
                <i className="bi bi-person-circle user-avatar"></i>
                <span className="d-none d-md-inline">Admin</span>
                <i className="bi bi-chevron-down ms-1" style={{ fontSize: '10px' }}></i>
              </Dropdown.Toggle>

              <Dropdown.Menu 
                className="dropdown-portal"
                style={{ 
                  border: `1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'}`,
                  background: theme === 'dark' ? '#1a1d23' : '#ffffff',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '200px'
                }}
              >
                <Dropdown.Item 
                  as={Link} 
                  to="/profile" 
                  className="dropdown-item-modern"
                  onClick={closeAllDropdowns}
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Dropdown.Item>
                
                <Dropdown.Item 
                  as={Link} 
                  to="/settings" 
                  className="dropdown-item-modern"
                  onClick={closeAllDropdowns}
                >
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </Dropdown.Item>
                
                <Dropdown.Divider style={{ 
                  borderColor: theme === 'dark' ? '#2d3748' : '#e2e8f0',
                  margin: '8px 0'
                }} />
                
                <Dropdown.Item 
                  className="dropdown-item-modern"
                  onClick={() => {
                    closeAllDropdowns();
                    // Add logout logic here
                    navigate('/login');
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Theme Toggle */}
            <button 
              className="notification-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon'} notification-bell`}></i>
            </button>
          </div>
        </Container>
      </Navbar>
    </>
  );
}

export default Navigation;