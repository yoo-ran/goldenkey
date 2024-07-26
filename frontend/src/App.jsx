// src/App.jsx
import { BrowserRouter as Router, Routes, Route,} from 'react-router-dom'; // Import Route component

import Home from './routes/Home';
import Login from './components/Login';
import User from "./components/User"
import Signup from './components/Signup';
import Delete from './components/Delete';
import Header from './components/layout/Header';
import Rental from './routes/Rental';
import Favorite from './routes/Favorite';
import Listing from './routes/Listing';
import PropertyDetail from './routes/Detail';



import "./index.css"


const App = () => {
    return (
        <Router>
            <Header/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" 
                    element={  <Login />}

                />
                <Route path="/user-page" element={<User  />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/delete" element={<Delete />} />
                <Route path="/rental" element={<Rental />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/listing" element={<Listing />} />
                <Route path="/detail/:pId" element={<PropertyDetail />} />
            </Routes>
        </Router>
    );
};

export default App;
