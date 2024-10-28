import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
    const location = useLocation(); // Get the current location
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const navigate = useNavigate(); // Hook for navigation
    const [open, setOpen] =useState(false)
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
        <header className='font-head w-full z-50'>
            <nav className='flexCol lg:py-5 relative'>
                <ul className={`w-full absolute divide-y-[0.1rem] divide-secondary flexCol text-center mobile_3_bold justify-around gap-x-4 bg-primary transition-[all] ${open? " top-16": "-top-52"}`}>
                    <li 
                        className={`w-full py-5  transition-all ${location.pathname === "/favorite" ? "text-primary-yellow lg:text-primary bg-secondary lg:bg-primary-yellow" : "text-primary-yellow"}`}
                    >
                        <Link to="/">홈</Link>
                    </li>
                    <li 
                        className={`w-full py-5 transition-all ${location.pathname === "/search" ? "text-primary-yellow lg:text-primary bg-secondary lg:bg-primary-yellow" : "text-primary-yellow"}`}
                    >
                        <Link to="/search">매물 검색</Link>
                    </li>
                    <li 
                        className={`w-full py-5 transition-all ${location.pathname === "/upload" ? "text-primary-yellow lg:text-primary bg-secondary lg:bg-primary-yellow" : "text-primary-yellow"}`}
                    >
                        <Link to="/upload">매물 업로드</Link>
                    </li>
                    <li 
                        className={`w-full py-5 transition-all ${location.pathname === "/importExcel" ? "text-primary-yellow lg:text-primary bg-secondaryylg:bg-primary-yellow" : "text-primary-yellow"}`}
                    >
                        <Link to="/importExcel">엑셀 업로드</Link>
                    </li>
                </ul>

                <div className='py-5 px-5 flexRow justify-between w-full z-50 bg-white'>
                    <div 
                        className='w-8/12 h-5 relative'
                        onClick={()=> setOpen(!open)}
                    >
                        <p className={`bg-primary w-7 h-0.5 absolute top-0 transition-all ${open ? "rotate-45 top-1/2":""}`}></p>
                        <p className={`bg-primary w-7 h-0.5 absolute top-1/2 transition-all transform -translate-y-1/2 ${open ? "hidden":""}`}></p>
                        <p className={`bg-primary w-7 h-0.5 absolute bottom-0 transition-all ${open ? "-rotate-45 top-1/2":""}`}></p>
                    </div>
                    <button 
                        className='hover:bg-navy transition-all bg-primary-yellow text-primary px-4 lg:py-2 rounded-lg'
                    >
                        <Link to="/login">로그인</Link>
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
