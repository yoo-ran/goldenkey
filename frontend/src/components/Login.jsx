import {useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


function Login(){
    const [email,setEmail] = useState("")
    const [pw, setPw] = useState("")
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8000/login", { email, pw });
            if (res.status == 200) {
                localStorage.setItem('user', JSON.stringify(res.data)); // Store user data in localStorage
                navigate('/user-page');
            } else {
                console.log("Invalid credentials");
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div>
            <div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input type="email" placeholder='Email' onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input type="password" placeholder='Password' onChange={e => setPw(e.target.value)}/>
                    </div>
                    <button>Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login