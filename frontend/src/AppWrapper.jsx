import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import App from './App'; // The App component you've shared

const AppWithRouter = () => {
  const navigate = useNavigate();

  // This function will handle redirection on session timeout
  const handleSessionTimeout = () => {
    navigate('/login');
  };

  return <App onSessionTimeout={handleSessionTimeout} />;
};

const AppWrapper = () => (
  <Router>
    <AppWithRouter />
  </Router>
);

export default AppWrapper;
