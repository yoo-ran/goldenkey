// Signup.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/signup", { fname, lname, email, password });
            console.log(response.data);
            navigate('/login'); // Redirect to the login page after successful signup
        } catch (err) {
            console.error("Error during signup:", err);
            setError("Signup failed. Please try again.");
        }
    };

    return (
        <div className='flexCol items-center gap-y-20  w-full h-screen'>
            <h2 className='text-3xl'>Signup</h2>
            <form 
                onSubmit={handleSignup} 
                className='border-2 border-yellow w-1/3 drop-shadow rounded-xl p-8 flexCol items-end gap-y-10'
            >
                <div className='w-full flexRow justify-start'>
                    <label htmlFor='fname'
                       className='w-1/4'
                    >First name</label>
                    <input
                        type="text"
                        placeholder='First name'
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        required
                        className='border-b-2 border-yellow ml-3 bg-transparent w-3/4'
                    />
                </div>
                <div className='w-full flexRow justify-start'>
                    <label htmlFor='lname'
                       className='w-1/4'
                    >Last name</label>
                    <input
                        type="text"
                        placeholder='Last name'
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                        required
                        className='border-b-2 border-yellow ml-3 bg-transparent w-3/4'
                    />
                </div>
                <div className='w-full flexRow justify-start'>
                    <label htmlFor='email'
                        className='w-1/4'
                    >Email</label>
                    <input
                        type="email"
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='border-b-2 border-yellow ml-3 bg-transparent w-3/4'
                    />
                </div>
                <div className='w-full flexRow justify-start'>
                    <label htmlFor='password'
                        className='w-1/4'
                    >Password</label>
                    <input
                        type="password"
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='border-b-2 border-yellow ml-3 bg-transparent w-3/4'
                    />
                </div>
                <div className='w-full flexRow justify-start'>
                    <label htmlFor='confirmPassword'
                        className='w-1/4'>Confirm Password</label>
                    <input
                        type="password"
                        placeholder='Confirm Password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className='border-b-2 border-yellow ml-3 bg-transparent w-3/4'
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button 
                    type="submit"
                    className='hover:bg-navy transition-all bg-yellow text-white border border-lightPurple lg:px-6 lg:py-2 rounded-full'

                >
                    Signup</button>
            </form>
        </div>
    );
};

export default Signup;
