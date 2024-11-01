// src/components/Logout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

const Logout = ({ onLogout }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await axios.post(
        `${apiUrl}/logout`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log(
          'Logout successful, calling onLogout and navigating to login'
        );
        alert('로그아웃이 성공적으로 완료되었습니다');
        onLogout(); // Update authentication status
        navigate('/login'); // Force immediate redirect to login page
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      id='alert-additional-content-4'
      className='absolute top-1/2 flexCol w-11/12 lg:w-1/2 py-6 px-4  text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800'
      role='alert'
    >
      <div className='flex items-center'>
        <FontAwesomeIcon icon={faCircleExclamation} />
        <span className='sr-only'>Info</span>
        <h3 className='text-lg font-bold'>로그아웃</h3>
      </div>
      <div className='mt-2 mb-4 text-sm'>
        <p>정말 로그아웃 하시겠습니까?</p>
      </div>
      <div className=''>
        <button
          type='button'
          className='hover:bg-primary-yellow transition-all bg-primary text-white border border-lightPurple px-4 py-1 lg:px-6 lg:py-2 rounded-lg'
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-dismiss-target='#alert-additional-content-4'
          aria-label='Close'
        >
          {isLoggingOut ? '로그아웃 하는 중' : '로그아웃'}
        </button>
      </div>
    </div>
  );
};

export default Logout;
