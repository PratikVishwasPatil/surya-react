import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Container, Nav, Dropdown, Badge, Modal, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navigation({ theme = 'dark', toggleTheme, themeStyles }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications] = useState(3);
  const [activeDropdowns, setActiveDropdowns] = useState(new Set());
  const [dropdownPositions, setDropdownPositions] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState(new Set());
  const scrollRef = useRef(null);
  const navbarRef = useRef(null);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const storedUserName = sessionStorage.getItem('shortname') ||
    sessionStorage.getItem('shortname') ||
    sessionStorage.getItem('shortname');

    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

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

        // Uncomment below for actual API call
        // const response = await axios.get('http://localhost/surya_apis/dynamic_navbar.php/user');
       // const userId = sessionStorage.getItem('userId');
        // alert(userId);
        const userId =1;
        const response = await axios.get(`http://93.127.167.54/Surya_React/surya_dynamic_api/dynamic_navbar.php?user_id=${userId}`, {
          headers: { 'Content-Type': 'application/json' }
        });
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

  // Mobile menu toggle handlers
  const toggleMobileItem = (itemId) => {
    const newExpanded = new Set(expandedMobileItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedMobileItems(newExpanded);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    setExpandedMobileItems(new Set());
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all localStorage data
    sessionStorage.clear();

    // Close modal and navigate to login
    setShowLogoutModal(false);
    navigate('/login');
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

  // Mobile menu rendering function
  const renderMobileSubMenu = (children, level = 1, parentPath = '') => {
    return children.map((child) => {
      const currentPath = `${parentPath}-${child.id}`;
      const hasChildren = child.children && child.children.length > 0;
      const isExpanded = expandedMobileItems.has(currentPath);

      return (
        <div key={child.id} className="mobile-menu-item">
          {hasChildren ? (
            <>
              <button
                className="mobile-menu-toggle"
                onClick={() => toggleMobileItem(currentPath)}
                style={{ paddingLeft: `${level * 20 + 16}px` }}
              >
                <div className="d-flex align-items-center justify-content-between w-100">
                  <div className="d-flex align-items-center">
                    <i className={`bi bi-${child.icon} me-2`} style={{ fontSize: '14px' }}></i>
                    <span>{child.name}</span>
                  </div>
                  <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                </div>
              </button>
              {isExpanded && (
                <div className="mobile-submenu">
                  {renderMobileSubMenu(child.children, level + 1, currentPath)}
                </div>
              )}
            </>
          ) : (
            <Link
              to={child.route}
              className="mobile-menu-link"
              onClick={closeMobileMenu}
              style={{ paddingLeft: `${level * 20 + 16}px` }}
            >
              <i className={`bi bi-${child.icon} me-2`} style={{ fontSize: '14px' }}></i>
              <span>{child.name}</span>
            </Link>
          )}
        </div>
      );
    });
  };

  const renderMobileMenuItems = () => {
    return menuItems.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedMobileItems.has(item.id.toString());

      return (
        <div key={item.id} className="mobile-menu-item">
          {hasChildren ? (
            <>
              <button
                className="mobile-menu-toggle main-item"
                onClick={() => toggleMobileItem(item.id.toString())}
              >
                <div className="d-flex align-items-center justify-content-between w-100">
                  <div className="d-flex align-items-center">
                    <i className={`bi bi-${item.icon} me-3`} style={{ fontSize: '16px' }}></i>
                    <span>{item.name}</span>
                  </div>
                  <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                </div>
              </button>
              {isExpanded && (
                <div className="mobile-submenu">
                  {renderMobileSubMenu(item.children, 1, item.id.toString())}
                </div>
              )}
            </>
          ) : (
            <Link
              to={item.route}
              className="mobile-menu-link main-item"
              onClick={closeMobileMenu}
            >
              <i className={`bi bi-${item.icon} me-3`} style={{ fontSize: '16px' }}></i>
              <span>{item.name}</span>
            </Link>
          )}
        </div>
      );
    });
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

          /* Mobile Menu Button */
          .mobile-menu-button {
            background: transparent;
            border: none;
            color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
            font-size: 24px;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .mobile-menu-button:hover {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.1)'};
            color: #3182ce;
          }

         /* Mobile Menu Styles */
          .mobile-menu-offcanvas {
            background: ${theme === 'dark' ? '#1a1d23' : '#ffffff'};
            border-right: 1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
          }

          .mobile-menu-header {
            padding: 20px;
            border-bottom: 1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
            display: flex;
            justify-content: between;
            align-items: center;
          }

          .mobile-menu-body {
            padding: 0;
            overflow-y: auto;
            max-height: calc(100vh - 100px);
          }

          .mobile-menu-item {
            border-bottom: 1px solid ${theme === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(226, 232, 240, 0.3)'};
          }

          .mobile-menu-toggle, .mobile-menu-link {
            width: 100%;
            padding: 16px;
            background: transparent;
            border: none;
            color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
            text-decoration: none;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 16px;
          }

          .mobile-menu-toggle:hover, .mobile-menu-link:hover {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.08)'};
            color: #3182ce;
          }

          .mobile-menu-toggle.main-item, .mobile-menu-link.main-item {
            font-weight: 600;
            font-size: 17px;
          }

          .mobile-submenu {
            background: ${theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'};
          }

          .theme-toggle {
            background: transparent;
            border: none;
            color: ${theme === 'dark' ? '#e2e8f0' : '#4a5568'};
            font-size: 20px;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .theme-toggle:hover {
            background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.1)'};
            color: #3182ce;
            transform: rotate(180deg);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .scroll-container {
              display: none;
            }
            
            .user-section {
              gap: 8px;
            }
            
            .user-toggle .d-none {
              display: none !important;
            }
          }

          @media (min-width: 769px) {
            .mobile-menu-button {
              display: none;
            }
          }

          /* Loading and Error States */
          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: ${theme === 'dark' ? '#a0aec0' : '#718096'};
          }

          .error-container {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #e53e3e;
            font-size: 14px;
          }
        `}
      </style>

      <Navbar
        ref={navbarRef}
        expand={false}
        className="horizontal-navbar px-3"
        style={fullScreenStyles.navbarStyle}
      >
        <Container fluid>
          {/* Brand */}
          <Navbar.Brand href="#" className="navbar-brand-modern">
            <i className="bi bi-grid-3x3-gap-fill me-2" style={{ fontSize: '24px', color: '#3182ce' }}></i>
            SURYA
          </Navbar.Brand>

          {/* <Link to="/dashboard" className="navbar-brand-modern" onClick={closeAllDropdowns}>
            <i className="bi bi-clipboard-check me-2" style={{ fontSize: '24px', color: '#3182ce' }}></i>
            <span className="d-none d-sm-inline">SURYA</span>
          </Link> */}

          {/* Desktop Menu - Horizontal Scrollable */}
          <div className="scroll-container d-none d-md-block">
            <button
              className="scroll-button scroll-button-left"
              onClick={() => handleScroll('left')}
            >
              <i className="bi bi-chevron-left" style={{ fontSize: '14px' }}></i>
            </button>

            <div className="horizontal-menu" ref={scrollRef}>
              {isLoading ? (
                <div className="loading-container">
                  <i className="bi bi-arrow-clockwise me-2" style={{ animation: 'spin 1s linear infinite' }}></i>
                  Loading menu...
                </div>
              ) : error ? (
                <div className="error-container">
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
            >
              <i className="bi bi-chevron-right" style={{ fontSize: '14px' }}></i>
            </button>
          </div>

          {/* Right Side - User Section */}
          <div className="user-section">
            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
            </button>

            {/* Notifications */}
            <button className="notification-button" title="Notifications">
              <i className="bi bi-bell notification-bell"></i>
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>

            {/* User Dropdown */}
            <Dropdown align="end" className="user-dropdown">
              <Dropdown.Toggle as="button" className="user-toggle">
                <i className="bi bi-person-circle user-avatar"></i>
                <span className="d-none d-sm-inline">{userName}</span>
                <i className="bi bi-chevron-down ms-1" style={{ fontSize: '12px' }}></i>
              </Dropdown.Toggle>

              <Dropdown.Menu
                style={{
                  background: theme === 'dark' ? '#1a1d23' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  minWidth: '200px'
                }}
              >
                <Dropdown.Item
                  className="dropdown-item-modern"
                  href="#profile"
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Dropdown.Item>
                <Dropdown.Item
                  className="dropdown-item-modern"
                  href="#settings"
                >
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </Dropdown.Item>
                <Dropdown.Divider style={{ borderColor: theme === 'dark' ? '#2d3748' : '#e2e8f0' }} />
                <Dropdown.Item
                  className="dropdown-item-modern"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button d-md-none"
              onClick={() => setShowMobileMenu(true)}
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
        </Container>
      </Navbar>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas
        show={showMobileMenu}
        onHide={closeMobileMenu}
        placement="start"
        className="mobile-menu-offcanvas"
        style={{ width: '280px' }}
      >
        <Offcanvas.Header className="mobile-menu-header">
          <Offcanvas.Title
            style={{
              color: theme === 'dark' ? '#ffffff' : '#1a202c',
              fontSize: '20px',
              fontWeight: '600'
            }}
          >
            <i className="bi bi-grid-3x3-gap-fill me-2" style={{ color: '#3182ce' }}></i>
            Menu
          </Offcanvas.Title>
          <button
            className="btn-close"
            onClick={closeMobileMenu}
            style={{
              filter: theme === 'dark' ? 'invert(1)' : 'none'
            }}
          ></button>
        </Offcanvas.Header>
        <Offcanvas.Body className="mobile-menu-body">
          {isLoading ? (
            <div className="loading-container">
              <i className="bi bi-arrow-clockwise me-2" style={{ animation: 'spin 1s linear infinite' }}></i>
              Loading menu...
            </div>
          ) : error ? (
            <div className="error-container">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : (
            renderMobileMenuItems()
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Logout Modal */}
      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            background: theme === 'dark' ? '#1a1d23' : '#ffffff',
            borderBottom: `1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'}`,
            color: theme === 'dark' ? '#ffffff' : '#1a202c'
          }}
        >
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            background: theme === 'dark' ? '#1a1d23' : '#ffffff',
            color: theme === 'dark' ? '#e2e8f0' : '#4a5568'
          }}
        >
          Are you sure you want to logout? You will be redirected to the login page.
        </Modal.Body>
        <Modal.Footer
          style={{
            background: theme === 'dark' ? '#1a1d23' : '#ffffff',
            borderTop: `1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'}`
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setShowLogoutModal(false)}
            style={{
              background: theme === 'dark' ? '#4a5568' : '#e2e8f0',
              borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0',
              color: theme === 'dark' ? '#ffffff' : '#4a5568'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
            style={{
              background: '#e53e3e',
              borderColor: '#e53e3e'
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add spinning animation for loading */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

export default Navigation;