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
        <div>
            <h1>Welcome, {user.fname}</h1>
            {/* Display user data */}
            <Edit user={user} setUser={setUser} />
            <Logout onLogout={handleLogout} />
            <Delete onDelete={handleDelete} user={user}/>

        </div>
    );
};

export default User;
