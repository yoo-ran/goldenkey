// DeleteAccount.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Delete = ({ onDelete, user }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            // Send a request to the server to delete the account
            await axios.delete(`http://localhost:8000/delete/${user.id}`);

            // Perform client-side cleanup tasks
            localStorage.removeItem('user');

            // Call the onDelete callback to handle further actions in the parent component
            onDelete();
            navigate('/signup'); // Redirect to the signup page or home page after account deletion
            console.log("Account deleted successfully!");
        } catch (error) {
            console.error("Error deleting account:", error);
            setIsDeleting(false);
        }
    };

    return (
        <div className='flexCol items-end gap-y-7'>
            <h2 className='w-full'>Delete Account</h2>
            <p>Are you sure you want to delete your account? <br/> This action cannot be undone.</p>
            <button
                className='hover:bg-yellow transition-all bg-navy text-white border border-lightPurple lg:px-6 lg:py-2 rounded-full'
                onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? "Deleting account..." : "Delete Account"}
            </button>
        </div>
    );
};

export default Delete;
