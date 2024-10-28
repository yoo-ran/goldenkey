import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation to the login page
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouseChimneyWindow,
  faHouse,
  faBuilding,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';

import House from '../filters/House.jsx';

const SearchHeader = ({ onSendSearchTerm }) => {
  const [openFilter, setOpenFilter] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Make a request to the server to verify the user's token (stored in HTTP-only cookie)
        const response = await axios.get('http://localhost:8000/check-auth', {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('User is not authenticated:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuthentication();
  }, []);

  const filterPropertyType = () => {
    switch (filterType) {
      case 'house/villa':
        return <House />;

      default:
        return null; // or any default component you'd like to render
    }
  };

  const searchHandle = (e) => {
    const searchTerm = e.target.value;
    // Pass the search term to the parent component (Search)
    onSendSearchTerm(searchTerm);
  };

  return (
    <section
      className={`w-11/12 lg:w-10/12 flexRow justify-between relative z-40 my-4  ${
        isAuthenticated ? 'relative' : 'hidden'
      }`}
    >
      <div
        className={`absolute top-12 flexCol bg-white gap-y-4 mobile_6 w-full overflow-hidden transition-[all]  ${
          openFilter ? 'translate-y-1.5' : 'hidden'
        }`}
      >
        <article className='mobile_4 border-b w-full text-center py-2'>
          <p>거주유형선택</p>
        </article>
        <article className='w-full'>
          <p className='mobile_4_bold'>옵션을 선택하세요</p>
          <div className='grid grid-cols-3 gap-x-4 mt-3'>
            <button
              onClick={() => setFilterType('house/villa')}
              className={`bg-secondary-light w-full  py-4 mobile_5 rounded-lg`}
            >
              <FontAwesomeIcon
                icon={faHouseChimneyWindow}
                className='mobile_1_bold'
              />
              <p>주택 / 빌라</p>
            </button>
            <button
              onClick={() => setFilterType('oneroom/tworoom')}
              className={`bg-secondary-light w-full py-4 mobile_5  rounded-lg`}
            >
              <FontAwesomeIcon icon={faHouse} className='mobile_1_bold' />
              <p>원룸 / 투룸</p>
            </button>
            <button
              onClick={() => setFilterType('apartment')}
              className={`bg-secondary-light w-full  py-4 mobile_5 rounded-lg `}
            >
              <FontAwesomeIcon icon={faBuilding} className='mobile_1_bold' />
              <p>아파트 / 오피스텔</p>
            </button>
          </div>
        </article>
        <article className='py-2 mobile_4 grid grid-cols-2 w-full gap-x-4'>
          <button className='bg-secondary-light w-full py-2 rounded'>
            초기화
          </button>
          <button className='bg-primary-yellow w-full py-2 rounded'>
            적용
          </button>
        </article>
      </div>
      <div className='flexCol'>
        <button
          className='flexCol bg-primary-yellow rounded-lg aspect-square w-10 px-3 py-2 '
          onClick={() => {
            setOpenFilter(!openFilter);
            console.log('lo');
          }}
        >
          <FontAwesomeIcon icon={faHouse} />
        </button>
      </div>

      <div className='flexRow gap-x-2 mobile_4 text-secondary bg-secondary-light p-2 rounded-lg lg:rounded-full lg:pl-8 lg:py-2 w-8/12'>
        <FontAwesomeIcon icon={faSearch} />
        <input
          type='search'
          placeholder='검색어를 입력하세요'
          className='bg-transparent text-primary mobile_3'
          onChange={searchHandle}
        />
      </div>
      <button className='mobile_3'>Cancel</button>
      <div
        className={`absolute flexCol z-50 top-32 border w-full py-20 bg-white ${
          filterType == '' ? 'hidden' : ''
        }`}
      >
        <button onClick={() => setFilterType('')}>X</button>
        {filterPropertyType()}
      </div>
    </section>
  );
};

export default SearchHeader;
