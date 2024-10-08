import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Memo = ({ propertyId, onMemoUpdate }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
    const [memo, setMemo] = useState('');  // Stores the current memo
    const [isEditing, setIsEditing] = useState(false);  // Tracks if the memo is being edited

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // Make a request to the server to verify the user's token (stored in HTTP-only cookie)
                const response = await axios.get('http://localhost:8000/check-auth', { withCredentials: true });
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('User is not authenticated:', error);
            }
        };

        checkAuthentication();
    }, []); // Dependency on `navigate`


    // Fetch the existing memo when the component mounts
    useEffect(() => {
        const fetchMemo = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/memos/${propertyId}`,  { withCredentials: true });
                if (response.data) {
                    setMemo(response.data.메모); // Set the memo content
                }
            } catch (error) {
                console.error('Error fetching memo:', error);
            }
        };
        
        fetchMemo();
    }, [propertyId]);

    // Handle input change
    const handleInputChange = (e) => {
        setMemo(e.target.value);
    };

    // Save or update the memo in the database
    const handleSaveMemo = async () => {
        if (memo.trim() === '') {
            alert('Memo cannot be empty');
            return;
        }



        try {
            if(propertyId!=undefined){
                await axios.post(`http://localhost:8000/memos/add`, {
                    propertyId,
                    content: memo,  // Send the memo content to the backend
                }, { withCredentials: true });
                alert('Memo saved successfully');
                setIsEditing(false);  // Exit edit mode after saving
            }else{
                onMemoUpdate(memo); // Notify parent component of the memo update
            }
        } catch (error) {
            console.error('Error saving memo:', error);
        }
    };

    // Delete the memo in the database
    const handleDeleteMemo = async () => {
        if (!window.confirm('Are you sure you want to delete this memo?')) {
            return;
        }

        try {
            await axios.post(`http://localhost:8000/memos/add`, {
                propertyId,
                content: '',  // Set memo to an empty string to delete it
            },  { withCredentials: true });
            setMemo(''); // Clear the memo state
            alert('Memo deleted successfully');
        } catch (error) {
            console.error('Error deleting memo:', error);
        }
    };

    return (
        <div className="border border-yellow p-10 rounded-xl flexCol gap-y-6">
        <h3 className='w-full'>메모</h3>

        {isEditing ? (
            <div>
                <textarea
                    value={memo}
                    onChange={handleInputChange}
                    placeholder="Edit memo"
                    className="border p-2 w-full"
                />
                <div className="mt-2">
                    <button onClick={handleSaveMemo} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                        Save Memo
                    </button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                </div>
            </div>
        ) : (
            <div>
                <p className='border px-2 py-8'>{memo || "No memo available"}</p>
                {memo ? (
                    <>
                        <button onClick={() => setIsEditing(true)} className="bg-yellow text-white px-4 py-2 mt-2 rounded mr-2">
                            Edit Memo
                        </button>
                        <button onClick={handleDeleteMemo} className="bg-red-500 text-white px-4 py-2 rounded">
                            Delete Memo
                        </button>
                    </>
                ) : (
                    isAuthenticated ?    <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
                    Add Memo
                </button> :""
                 
                )}
            </div>
        )}
    </div>
    );
};

export default Memo;