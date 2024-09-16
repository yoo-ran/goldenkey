import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
    const location = useLocation(); // Get the current location
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // Make a request to the server to verify the user's token (stored in HTTP-only cookie)
                const response = await axios.get('http://localhost:8000/check-auth', { withCredentials: true });
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }else{
                    navigate("/login")
                }
            } catch (error) {
                console.error('User is not authenticated:', error);
                navigate("/login")
                setIsAuthenticated(false);
                const detailPathRegex = /^\/detail\/\d+$/; // Matches /detail/1, /detail/2, etc.
                if (location.pathname !== "/listing" && !detailPathRegex.test(location.pathname)) {
                    navigate("/login");
                }
            }
        };

        const detailPathRegex = /^\/detail\/\d+$/; // Matches /detail/1, /detail/2, etc.
        if (location.pathname !== "/listing" && !detailPathRegex.test(location.pathname)) {
            checkAuthentication();
        }
    }, [location.pathname, navigate]);

    return (
        <header className='font-head w-full'>
            <nav className='flexRow justify-end lg:py-4'>
                <ul className='flexRow justify-around gap-x-4 lg:w-1/2'>
                    <li 
                        className={`transition-all ${location.pathname === "/listing" ? "text-yellow" : "hover:text-yellow"}`}
                    >
                        <Link to="/listing">Listing</Link>
                    </li>
                    <li 
                        className={`transition-all ${location.pathname === "/favorite" ? "text-yellow" : "hover:text-yellow"}`}
                    >
                        <Link to="/favorite">Favorites</Link>
                    </li>
                    <li 
                        className={`transition-all ${location.pathname === "/search" ? "text-yellow" : "hover:text-yellow"}`}
                    >
                        <Link to="/search">Search</Link>
                    </li>
                    <li 
                        className={`transition-all ${location.pathname === "/importExcel" ? "text-yellow" : "hover:text-yellow"}`}
                    >
                        <Link to="/importExcel">Import Excel</Link>
                    </li>
                    <li 
                        className={`transition-all ${location.pathname === "/upload" ? "text-yellow" : "hover:text-yellow"}`}
                    >
                        <Link to="/upload">Upload</Link>
                    </li>
                    <button 
                        className='hover:bg-navy transition-all bg-primary-yellow text-white border border-lightPurple lg:px-6 lg:py-2 rounded-full'
                    >
                     {
                        isAuthenticated ? <Link to="/user-page">Profile</Link> : <Link to="/login">Login</Link>
                    } 
                    </button>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
