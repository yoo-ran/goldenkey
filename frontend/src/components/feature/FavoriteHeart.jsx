import { useState, useEffect } from 'react';
import axios from 'axios';
import { faHeart as faSolidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FavoriteHeart = ({ propertyId, onHeartClick }) => {
console.log(propertyId);
    return (
        <div 
            className="absolute top-1 right-1" 
          onClick={() => onHeartClick(propertyId)}  // Trigger the parent function
        >
            <div className='relative'>
                {/* Regular heart when not favorited */}
              
            </div>
        </div>
    );
};

export default FavoriteHeart;
