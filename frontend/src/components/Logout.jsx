import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Logout = ({ onLogout }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Perform any cleanup or logout-related tasks here (e.g., invalidate session)
            // For example, you might send a request to your server to invalidate the session
            // and then update the state or perform any necessary client-side cleanup.
            // For demonstration purposes, we'll just log out the user locally in this example.
            await axios.post("http://localhost:8000/logout");
            // Clear user data from local storage
            localStorage.removeItem('user');
            
            // Call the onLogout callback to handle the logout process in the parent component
            onLogout();
            navigate('/login');
            console.log("Logged out successfully!");
        } catch (error) {
            console.error("Error logging out:", error);
            setIsLoggingOut(false);
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
