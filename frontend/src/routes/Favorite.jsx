// src/components/User.jsx
import {useEffect, useState } from "react";
import axios from 'axios';


const Favorite = ({ propertyId, updatePropertyId  }) => {
    console.log(propertyId);
    const [favoriteIds, setFavoriteIds] = useState([])
console.log(favoriteIds);
    const fetchFavoriteIds = async () => {
        try {
            const response = await axios.get('http://localhost:8000/get-favorites', { withCredentials: true });
            if (response.status === 200) {
                setFavoriteIds(response.data.favorites); // Assuming 'favorites' is the array of property IDs
            }
        } catch (error) {
            console.error('Error fetching favorite IDs:', error);
        }
    };

    useEffect(()=>{
        fetchFavoriteIds()
    },[])

    const saveFavoriteToServer = async (updatedFavorites) => {
        try {
            console.log("Saving to server:", updatedFavorites);
            handleClick(updatedFavorites)
            await axios.post('http://localhost:8000/save-favorites', { favorites: updatedFavorites }, { withCredentials: true });
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    };

    useEffect(()=>{
        const updatedFavorites = favoriteIds.includes(propertyId)
        ? favoriteIds.filter(id => id !== propertyId) // Remove propertyId if it exists
        : [...favoriteIds, propertyId]; // Add propertyId if it doesn't exist

        console.log("Updated Favorites:", updatedFavorites); // For debugging purposes

        // Save the updated favorites to the server and update the UI immediately
        saveFavoriteToServer(updatedFavorites);
        setFavoriteIds(updatedFavorites); // Immediately reflect the change in the UI

    },[propertyId])



    return (
        <main>
            Favorite
        </main>
    );
};

export default Favorite;