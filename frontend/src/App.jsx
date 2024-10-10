// src/App.jsx
import { BrowserRouter as Router, Routes, Route,} from 'react-router-dom';
import { useState } from 'react'; 

import Home from './routes/Home';
import Login from './components/Login';
import User from "./components/User"
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



import "./index.css"


const App = () => {
    const [searchTerm, setSearchTerm] = useState(""); // State for search term

    const handleSearchTerm = (term) => {
        setSearchTerm(term); // Update search term from SearchHeader
    };

    return (
        <Router>
            <Header />
            <SearchHeader onSendSearchTerm={handleSearchTerm} />
            
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/user-page" element={<User />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/delete" element={<Delete />} />
                <Route path="/importExcel" element={<ImportExcel />} />
                <Route path="/favorite" element={<Favorite />} />
                {/* Pass searchTerm to the Search component */}
                <Route path="/search" element={<Search searchTerm={searchTerm} />} />
                <Route path="/upload" element={<PropertyUpload />} />
                <Route path="/listing" element={<Listing />} />
                <Route path="/detail/:pId" element={<PropertyDetail />} />
            </Routes>
        </Router>
    );
};

export default App;
