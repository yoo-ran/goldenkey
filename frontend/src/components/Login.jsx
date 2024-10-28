import {useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Login(){
    const apiUrl = import.meta.env.VITE_API_URL;

    const [formData, setFormData] = useState({ email: '', pw: '' });
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [errorMessage, setErrorMessage] = useState(''); // New state to manage error messages

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { email, pw } = formData;
            const response = await axios.post(`${apiUrl}/login`, { email, pw },{ withCredentials: true } );

            if (response.status === 200) {
                alert('Login successful!');
                navigate(`/upload`);
            } else {
                console.log('Invalid credentials');
            }
        } catch (error) {
            console.error('Error during login:', error.response ? error.response.data : error.message);
            setIsLogin(false)
        }
    };

    const toggleForm = () => {
        setIsLogin(prevState => !prevState);
        navigate(`/signup`);
    };


    return (
        <div className='w-full flexCol h-screen border'>
            <form onSubmit={handleSubmit} className='w-11/12 rounded-xl p-8 flexCol items-start gap-y-14'>
                <div className='flexCol w-full  gap-y-4'>
                    <input
                        type="email"
                        name="email"
                        placeholder="이메일"
                        value={formData.email}
                        onChange={handleChange}
                        className='w-full bg-secondary-light rounded-lg p-3 mobile_4'
                    />
                    <input
                        type="password"
                        name="pw"
                        placeholder="Password"
                        value={formData.pw}
                        onChange={handleChange}
                        className='w-full bg-secondary-light rounded-lg p-3 mobile_4'
                    />
                    <button
                        className='mobile_4 w-full text-right'
                    >
                        비밀번호를 잊어버렸다면?
                    </button>
                </div>
                <div className='flexCol w-full gap-y-4'>
                    {/* <button 
                            className='hover:bg-navy w-full mobile_4 transition-all bg-primary text-white rounded-lg p-3'
                    >
                        회원가입
                    </button> */}

                    <button type="submit" 
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

            {/* {!isLogin && <Signup />} */}
        </div>
    )
}

export default Login