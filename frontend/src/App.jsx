import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import Home from './routes/Home';
import Login from './components/Login';
import User from './components/User';
import Signup from './components/Signup';
import Delete from './components/Delete';
import Header from './components/layout/Header';
import ImportExcel from './routes/ImportExcelPage';
import PropertyDetail from './routes/Detail';
import PropertyUpload from './routes/UploadProperty';
import Search from './routes/Search';
import SearchHeader from './components/layout/SearchHeader';
import Logout from './components/Logout';

import './index.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
  };
  const handleSearchTerm = (term) => {
    setSearchTerm(term);
  };

  console.log(isAuthenticated);
  return (
    <BrowserRouter>
      {isAuthenticated && (
        <>
          <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          <SearchHeader
            onSendSearchTerm={handleSearchTerm}
            isAuthenticated={isAuthenticated}
          />
        </>
      )}

      <Routes>
        <Route
          path='/'
          element={isAuthenticated ? <Home /> : <Navigate to='/login' />}
        />
        <Route
          path='/login'
          element={
            isAuthenticated ? (
              <Navigate to='/' />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        {isAuthenticated ? (
          <>
            <Route path='/user-page' element={<User />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/delete' element={<Delete />} />
            <Route path='/importExcel' element={<ImportExcel />} />
            <Route
              path='/search'
              element={<Search searchTerm={searchTerm} />}
            />
            <Route path='/upload' element={<PropertyUpload />} />
            <Route path='/detail/:propertyId' element={<PropertyDetail />} />
            <Route
              path='/logout'
              element={<Logout onLogout={handleLogout} />}
            />
          </>
        ) : (
          <Route path='*' element={<Navigate to='/login' />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
