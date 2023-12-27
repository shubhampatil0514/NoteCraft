import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post('http://localhost:3006/users/login', { username, password });
      const { message, token } = response.data;

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      localStorage.setItem('userId', userId);
      localStorage.setItem('token', token);
      setMessage(message);
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      localStorage.setItem('userId', userId);
    }
  }, []);

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
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form>
            <div className="mb-4">
              <label className="font-bold">Email:</label>
              <input
                type="email"
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
            <button
              type="submit"
              onClick={handleLogin}
              className="bg-gray-900 text-white py-2 px-4 rounded font-bold cursor-pointer"
            >
              Login
            </button>
            <p className="mt-2 text-sky-500"></p>
          </form>
          {message && <p>{message}</p>}
        </div>
        <div className="flex justify-center mt-4">
          <div className="bg-gray-900 w-32 h-1 mt-2 mb-2"></div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleSignupClick}
            className="bg-gray-900 text-white py-2 px-4 rounded font-bold cursor-pointer mt-2"
          >
            Create Your Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
