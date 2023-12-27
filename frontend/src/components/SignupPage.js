import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('profilePicture', profilePicture);
  
      const response = await axios.post('http://localhost:3006/users/create', formData);
  
      if (response.status >= 200 && response.status < 300) {
        // Success: Status code in the 2xx range indicates success
        setUsername('');
        setPassword('');
        setProfilePicture(null);
        setMessage('User registered successfully');
      } else {
        // Failure: Status code outside the 2xx range indicates an error
        setMessage('Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.message);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row">
      <div className="sm:w-full lg:w-1/2">
        <img
          src="./image/Login.jpeg"
          alt="Background Image"
          className="w-full h-64 sm:h-screen object-cover"
        />
      </div>
      <div className="w-full lg:w-1/2 pt-8 bg-blue-400">
        <div className="bg-white rounded p-4 flex flex-col items-center max-w-xs mx-auto mt-4">
          <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
          <form>
            <div className="mb-4">
              <label className="font-bold">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="font-bold">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="font-bold">Profile Picture:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none"
              />
            </div>
            <button
              type="submit"
              onClick={handleSignup}
              className="bg-gray-900 text-white py-2 px-4 rounded font-bold cursor-pointer"
            >
              Sign Up
            </button>
          </form>
          {message && <p className="text-green-500 mt-2">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Signup;
