import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation(); // Get the current location
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [isUser, setIsUser] = useState(false)

    useEffect(()=>{
        if(user.id === undefined){
            setIsUser(false)
        }else{
            setIsUser(true)
        }
    },[user])
    console.log(user);
    
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
                        className={`transition-all ${location.pathname === "/rental" ? "text-yellow" : "hover:text-yellow"}`}
                    >
                        <Link to="/rental">Room Rental</Link>
                    </li>
                    <li 
                        className={`transition-all ${location.pathname === "/upload" ? "text-yellow" : "hover:text-yellow"}`}
                    >
                        <Link to="/upload">Upload</Link>
                    </li>
                    <button 
                        className='hover:bg-navy transition-all bg-yellow text-white border border-lightPurple lg:px-6 lg:py-2 rounded-full'
                    >
                       {isUser ? <Link to="/user-page">Profile</Link> : <Link to="/login">Login</Link>}
                    </button>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
