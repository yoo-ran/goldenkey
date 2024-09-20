import { useState, useEffect } from 'react';
import axios from 'axios';
import { faHeart as faSolidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FavoriteHeart = ({ propertyId, updatePropertyId }) => {
    const [favoriteIds, setFavoriteIds] = useState([]); // State to store the user's favorite property IDs
    const [toggle, setToggle] =useState(false)
    // Fetch the user's favorite IDs from the server on component mount
    // const fetchFavoriteIds = async () => {
    //     try {
    //         const response = await axios.get('http://localhost:8000/get-favorites', { withCredentials: true });
    //         if (response.status === 200) {
    //             setFavoriteIds(response.data.favorites); // Assuming 'favorites' is the array of property IDs
    //         }
    //     } catch (error) {
    //         console.error('Error fetching favorite IDs:', error);
    //     }
    // };

    // useEffect(() => {
    //     fetchFavoriteIds(); // Fetch favorites when the component mounts
    //     console.log(favoriteIds);
    // }, [toggle]);



    // Function to handle the click event and update favoriteIds
    const toggleFavorite = () => {
        updatePropertyId(propertyId); // Pass new ID to parent
        setToggle(!toggle)
    };

    return (
        <div className="absolute top-1 right-1" onClick={toggleFavorite}>
            <div className='relative'>
                {/* Regular heart when not favorited */}
                <FontAwesomeIcon icon={faRegularHeart} className='absolute top-0 right-0 text-primary border border-white p-1 rounded-full mobile_5'/>
                {/* Solid heart when favorited */}
                {favoriteIds.includes(propertyId) ? (
                    <FontAwesomeIcon icon={faSolidHeart} className='absolute top-0 right-0 p-1 border rounded-full mobile_5 text-primary-yellow' />
                ) : ""}
            </div>
        </div>
    );
};

export default FavoriteHeart;
