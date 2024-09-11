import {useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Login(){
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
            const response = await axios.post('http://localhost:8000/login', { email, pw },{ withCredentials: true } );

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
        <div className='w-full flexRow h-screen'>
            <form onSubmit={handleSubmit} className='border-2 border-yellow w-1/3 drop-shadow rounded-xl p-8 flexCol items-start gap-y-10'>
                <div className='flexRow w-full'>
                    <label htmlFor="email" 
                        className='w-1/4'
                    >Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className='border-b-2 border-yellow ml-3 bg-transparent w-3/4'
                    />
                </div>
                <div className='flexRow w-full'>
                    <label htmlFor="pw"
                        className='w-1/4'
                    >Password</label>
                    <input
                        type="password"
                        name="pw"
                        placeholder="Password"
                        value={formData.pw}
                        onChange={handleChange}
                        className='border-b-2 border-yellow ml-3 bg-transparent w-3/4'
                    />
                </div>
                <div className='flexRow justify-end w-full gap-x-4'>
                    <button type="submit" 
                            className='hover:bg-navy transition-all bg-yellow text-white border border-lightPurple lg:px-6 lg:py-2 rounded-full'
                    >
                        Login
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