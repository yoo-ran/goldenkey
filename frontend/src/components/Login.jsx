import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

function Login({ setIsAuthenticated }) {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({ email: '', pw: '' });
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, pw } = formData;
      const response = await axios.post(
        `${apiUrl}/login`,
        { email, pw },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert('로그인이 성공적으로 완료되었습니다!');
        navigate(`/upload`);
        setError(false);
        setIsAuthenticated(true);
      } else {
        setError(true);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(
        'Error during login:',
        error.response ? error.response.data : error.message
      );
      setError(true);
      setIsAuthenticated(false);
    }
  };

  

  return (
    <div className='w-full flexCol h-screen border'>
      <div
        className={`p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 
        ${error ? 'block' : 'hidden'}
        `}
        role='alert'
      >
        <FontAwesomeIcon icon={faCircleExclamation} />
        <span className='font-bold ml-1'>로그인 실패!</span>
        <p>로그인 인증에 실패했습니다. 다시 시도해 주세요.</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className='w-11/12 rounded-xl p-8 flexCol items-start gap-y-14'
      >
        <div className='flexCol w-full  gap-y-4'>
          <input
            type='email'
            name='email'
            placeholder='이메일'
            value={formData.email}
            onChange={handleChange}
            className='w-full bg-secondary-light rounded-lg p-3 mobile_4'
          />
          <input
            type='password'
            name='pw'
            placeholder='비밀번호'
            value={formData.pw}
            onChange={handleChange}
            className='w-full bg-secondary-light rounded-lg p-3 mobile_4'
          />
          <button className='mobile_4 w-full text-right'>
            비밀번호를 잊어버렸다면?
          </button>
        </div>
        <div className='flexCol w-full gap-y-4'>
          {/* <button 
                            className='hover:bg-navy w-full mobile_4 transition-all bg-primary text-white rounded-lg p-3'
                    >
                        회원가입
                    </button> */}

          <button
            type='submit'
            className='hover:bg-navy w-full mobile_4 transition-all bg-primary-yellow text-white rounded-lg p-3'
          >
            로그인
          </button>
          {/* <button onClick={toggleForm}
                            type="submit" 
                            className='hover:bg-yellow transition-all bg-navy text-white border border-lightPurple lg:px-6 lg:py-2 rounded-full'
                    >
                        Signup
                    </button> */}
        </div>
      </form>
    </div>
  );
}

export default Login;
