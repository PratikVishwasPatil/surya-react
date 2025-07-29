import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import DynamicForm from './DynamicForm';
import MultipleDynamicForm2 from './MultipleDynamicForm2';
import MultipleDynamicForm from './MultipleDynamicForm';
import SampleTable from './SampleTable';
import Login from './Login';
import EditUser from './EditUser';

function AppWrapper() {
  const [theme, setTheme] = React.useState('light');
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const themeStyles = {
    navBg: theme === 'light' ? 'light' : 'dark',
  };

  // 🔒 Hide Navigation on the Login page
  const hideNavOnRoutes = ['/login'];
  const hideNavigation = hideNavOnRoutes.includes(location.pathname);

  return (
    <div className={`app-container ${theme}`}>
      {!hideNavigation && (
        <Navigation theme={theme} toggleTheme={toggleTheme} themeStyles={themeStyles} />
      )}
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hr/role-management/add-user" element={<DynamicForm />} />
          <Route path="/hr/role-management/user-list" element={<SampleTable />} />
          <Route path="/add-user/:id" element={<EditUser />} />
          <Route path="/hr/role-management/add-student" element={<DynamicForm />} />
          
          <Route path="/marketing/company/add-company" element={<MultipleDynamicForm />} />
          <Route path="/marketing/company/company-list" element={<SampleTable />} />
          <Route path="/marketing/project/add-project" element={<MultipleDynamicForm />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
