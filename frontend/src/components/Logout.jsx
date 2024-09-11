import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Logout = ({ onLogout }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const response = await axios.post('http://localhost:8000/logout', {}, { withCredentials: true });
            if (response.status === 200) {
                alert('Logged out successfully');
                // Redirect to login or home page
                navigate('/login');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className='flexCol items-end gap-y-7'>
            <h2 className='w-full'>Logout</h2>
            <p>Are you sure you want to log out?</p>
            <button 
                className='hover:bg-yellow transition-all bg-navy text-white border border-lightPurple lg:px-6 lg:py-2 rounded-full'
                onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
        </div>
    );
};

export default Logout;
