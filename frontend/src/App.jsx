// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import Home from './routes/Home';
import Login from './components/Login';
import User from './components/User';
import Signup from './components/Signup';
import Delete from './components/Delete';
import Header from './components/layout/Header';
import ImportExcel from './routes/ImportExcelPage';
import Favorite from './routes/Favorite';
import Listing from './routes/Listing';
import PropertyDetail from './routes/Detail';
import PropertyUpload from './routes/UploadProperty';
import Search from './routes/Search';
import SearchHeader from './components/layout/SearchHeader';
import Logout from './components/Logout';

import './index.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //   const navigate = useNavigate();

  const handleSearchTerm = (term) => {
    setSearchTerm(term);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <SearchHeader
        onSendSearchTerm={handleSearchTerm}
        isAuthenticated={isAuthenticated}
      />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/login'
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path='/user-page' element={<User />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/delete' element={<Delete />} />
        <Route path='/importExcel' element={<ImportExcel />} />
        <Route path='/favorite' element={<Favorite />} />
        <Route path='/search' element={<Search searchTerm={searchTerm} />} />
        <Route path='/upload' element={<PropertyUpload />} />
        <Route path='/listing' element={<Listing />} />
        <Route path='/detail/:propertyId' element={<PropertyDetail />} />
        <Route path='/logout' element={<Logout onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
};

export default App;
