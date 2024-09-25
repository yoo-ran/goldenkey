import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';


const Memo = ({ onMemoUpdate }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
    const [propertyId, setPropertyId] = useState()
    const [memo, setMemo] = useState('');  // Stores the current memo
    const [isEditing, setIsEditing] = useState(false);  // Tracks if the memo is being edited
    const [openMemo, setOpenMemo] = useState(false)
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
        console.log(e.target.value);
        if(e.target.name === "propertyId"){
            setPropertyId(e.target.value)
        }else{
            setMemo(e.target.value);
        }
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

    const handleOpenMemo = () => {
        setOpenMemo(!openMemo)
    }

    return (
        <div className="fixed bottom-4 right-2 z-50">
            {/* Memo button */}
            <div className={`absolute -top-72 w-72 flexCol items-end gap-y-3 rounded bg-primary p-3 transition-all ${openMemo ? "right-0":"-right-80"}`}>
                <FontAwesomeIcon icon={faPenToSquare} className='text-primary-yellow self-start'/>
                <div className='flexRow gap-x-2 w-full'>
                    <label htmlFor="" className='mobile_4 text-secondary-light'>매물번호</label>
                    <input 
                        type="number"
                        name='propertyId'
                        placeholder='매물번호를 입력하시오'
                        onChange={handleInputChange}
                        className='bg-secondary-light'
                    />
                </div>
                <textarea
                    onChange={handleInputChange}
                    rows={5}
                    name='memo'
                    placeholder="Edit memo"
                    className="p-1 bg-primary w-full text-primary-yellow"
                />
                <div className="mt-2">
                    <button onClick={handleSaveMemo} className="bg-primary-yellow text-white p-4 rounded mr-2 mobile_3">
                        저장
                    </button>
                </div>
            </div>
            <div className='rounded bg-primary w-8 h-8 flexCol' onClick={handleOpenMemo}>
                <FontAwesomeIcon icon={faPenToSquare} className='text-primary-yellow'/>
            </div>
    </div>
    );
};

export default Memo;