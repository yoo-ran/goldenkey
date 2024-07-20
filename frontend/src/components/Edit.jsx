// src/components/EditProfile.jsx
import { useState, } from "react";
import axios from "axios";

const EditProfile = ({ user, setUser }) => {
  const [newUserData, setNewUserData] = useState(user);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setNewUserData(prevState => ({ ...prevState, [name]: value }));
  }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put("http://localhost:8000/update-user", newUserData); // Update user data in backend
            localStorage.setItem('user', JSON.stringify(newUserData)); // Update user data in localStorage
            setUser(newUserData); // Update user state
            console.log("Profile updated successfully!");
            console.log(res);
        } catch (err) {
            console.log("An error occurred while updating profile:", err);
        }
    }

    return (
        <div>
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='name'>Name</label>
                    <input type="text" name="fname" value={newUserData.fname || ''} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor='email'>Email</label>
                    <input type="email" name="email" value={newUserData.email || ''} onChange={handleChange} />
                </div>
                {/* Add other fields as needed */}
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default EditProfile;
