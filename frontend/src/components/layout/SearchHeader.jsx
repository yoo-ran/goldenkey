import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation to the login page
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouseChimneyWindow,
  faHouse,
  faBuilding,
  faSearch,
  faFilter,
  faSort,
} from '@fortawesome/free-solid-svg-icons';

import House from '../filters/House.jsx';

const approvalDate = ['15년 이상', '15년 이내', '10년 이내', '5년 이내'];

const SearchHeader = ({ onSendSearchTerm }) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [openFilter, setOpenFilter] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
  const navigate = useNavigate(); // Hook for navigation

  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Make a request to the server to verify the user's token (stored in HTTP-only cookie)
        const response = await axios.get(`${apiUrl}/check-auth`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          navigate('/login'); // Redirect to login if authentication fails
        }
      } catch (error) {
        console.error('User is not authenticated:', error);
        navigate('/login'); // Redirect to login if authentication fails
      }
    };

    checkAuthentication();
  }, [navigate]);

  const searchHandle = (e) => {
    const searchTerm = e.target.value;
    console.log('Search Term in SearchHeader:', searchTerm);

    // Pass the search term to the parent component
    if (onSendSearchTerm) {
      onSendSearchTerm(searchTerm);
    } else {
      console.error('onSendSearchTerm is not defined!');
    }
  };

  const onOpenFromChild = (openFromChild) => {
    if (openFromChild === false) setFilterType('');
    setOpenFilter(false);
  };

  console.log(openFilter);

  return (
    <section
      className={`w-full md:w-full x  z-40 flexCol my-6 ${
        isAuthenticated ? 'relative' : 'hidden'
      }`}
    >
      <div className={`relative w-full  top-14  flexCol gap-y-4`}>
        <article
          className={`absolute flexCol top-4 md:top-2 z-40 md:right-0 border w-full  py-8 bg-white transition-all overflow-hidden transform ${
            openFilter === false ? 'scale-y-0' : ''
          }`}
        >
          <House approvalDate={approvalDate} onOpen={onOpenFromChild} />
        </article>
      </div>

      <article className='flexRow justify-between w-11/12 md:w-10/12 '>
        <div className='flexCol'>
          <button
            className='flexCol bg-primary-yellow rounded-md aspect-square w-10 px-3 py-2 '
            onClick={() => {
              setOpenFilter(!openFilter);
            }}
          >
            <FontAwesomeIcon icon={faFilter} />
          </button>
        </div>

        <div className='flexRow gap-x-2 mobile_4 text-secondary bg-secondary-light p-2 rounded-md md:rounded-full md:pl-8 md:py-2 w-8/12'>
          <FontAwesomeIcon icon={faSearch} />
          <input
            type='search'
            placeholder='검색어를 입력하세요'
            className='bg-transparent text-primary mobile_3'
            onChange={searchHandle}
          />
        </div>
        <button className='mobile_3'>검색</button>
      </article>
    </section>
  );
};

export default SearchHeader;
