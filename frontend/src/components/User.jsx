// src/components/User.jsx
import {useEffect, useState } from "react";
import Edit from "./Edit";
import Logout from './Logout';
import Delete from './Delete';

const User = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Assuming the user is initially logged in
    
    const handleLogout = () => {
        // Perform any necessary cleanup tasks here, such as updating state or clearing user data
        setIsLoggedIn(false); // Update the isLoggedIn state to reflect that the user is logged out
    };
    const handleDelete = () => {
        setIsLoggedIn(false); // Update the isLoggedIn state to reflect that the user is logged out after account deletion
    };


    return (
        <div className='flexCol items-start gap-y-20  w-1/2 h-screen'>
            <h1>Welcome, <span className='capitalize text-yellow'>{user.fname}</span></h1>
            {/* Display user data */}
            <div className='border-2 border-yellow rounded-xl p-4'>
                <Edit user={user} setUser={setUser} />
            </div>
            <div className='border-2 border-yellow rounded-xl p-4'>
                <Logout onLogout={handleLogout} />
            </div>
            <div className='border-2 border-yellow rounded-xl p-4'>
                <Delete onDelete={handleDelete} user={user}/>
            </div>

        </div>
    );
};

export default User;
