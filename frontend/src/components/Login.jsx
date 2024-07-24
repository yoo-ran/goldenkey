import {useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


function Login(){
    const [formData, setFormData] = useState({ email: '', pw: '' });
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { email, pw } = formData;
            const response = await axios.post('http://localhost:8000/login', { email, pw });
            if (response.status === 200) {
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/user-page');
            } else {
                console.log('Invalid credentials');
            }
        } catch (error) {
            console.error('Error during login:', error.response ? error.response.data : error.message);
        }
    };

    const toggleForm = () => {
        setIsLogin(prevState => !prevState);
    };


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="pw">Password</label>
                    <input
                        type="password"
                        name="pw"
                        placeholder="Password"
                        value={formData.pw}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {!isLogin && <Signup />}
            <button onClick={toggleForm}>
                {isLogin ? 'Go to Signup' : 'Go to Login'}
            </button>
        </div>
    )
}

export default Login