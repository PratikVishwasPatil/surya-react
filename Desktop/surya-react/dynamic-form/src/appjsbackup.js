import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import DynamicForm from './DynamicForm';

function App() {
  const [theme, setTheme] = React.useState('light');
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const themeStyles = {
    navBg: theme === 'light' ? 'light' : 'dark',
  };

  return (
    <Router>
      <div className={`app-container ${theme}`}>
        <Navigation theme={theme} toggleTheme={toggleTheme} themeStyles={themeStyles} />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forms/dynamic-form" element={<DynamicForm />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;