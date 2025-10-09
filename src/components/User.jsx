// src/components/User.jsx
import {useEffect, useState } from "react";
import axios from 'axios';

import Edit from "./Edit";
import Logout from './Logout';
import Delete from './Delete';

const User = () => {
    const [user, setUser] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
    
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // Make a request to the server to verify the user's token (stored in HTTP-only cookie)
                const response = await axios.get('http://localhost:8000/check-auth', { withCredentials: true });
                if (response.status === 200) {
                    setIsAuthenticated(true);
                    setUser(response.data.user)
                }
            } catch (error) {
                console.error('User is not authenticated:', error);
            }
        };

        checkAuthentication();
    }, []); // Dependency on `navigate`


    return (
        <div className='flexCol items-start gap-y-20  w-1/2 h-screen'>
            <h1>Welcome, <span className='capitalize text-yellow'>{user.email}</span></h1>
            {/* Display user data */}
            <div className='border-2 border-yellow rounded-xl p-4'>
                <Edit user={user} setUser={setUser} />
            </div>
            <div className='border-2 border-yellow rounded-xl p-4'>
                <Logout />
            </div>
            <div className='border-2 border-yellow rounded-xl p-4'>
                <Delete user={user}/>
            </div>

        </div>
    );
};

export default User;
