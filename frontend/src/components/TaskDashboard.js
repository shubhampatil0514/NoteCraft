import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

function TaskDashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStatus, setEditStatus] = useState('');
  const [error, setError] = useState(null);

  const socket = io('http://localhost:3000');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      axios
        .get(`http://localhost:3006/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUser(response.data.user);
        })
        .catch((error) => {
          setError('Error fetching user details. Please try again.');
        });

      axios
        .get(`http://localhost:3006/task/${userId}`)
        .then((response) => {
          setTasks(response.data.tasks);
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            setError('No tasks found for this user.');
          } else {
            setError('An error occurred while fetching tasks.');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setError('Invalid token. Please log in again.');
    }
  }, [navigate]);

  const handleAddTask = () => {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId;

    // Send a POST request to create the task
    axios
      .post(`http://localhost:3006/task/${userId}`, {
        title,
        description,
        status,
        createdBy: userId,
      })
      .then((response) => {
        socket.emit('newTask', { message: 'A new task was added' });
        // Handle success, e.g., clear the input fields and set the success message
        setTitle('');
        setDescription('');
        setStatus('');
        setSuccessMessage('Task added successfully.');
      })
      .catch((error) => {
        // Handle errors, e.g., display an error message
        console.error('Error adding the task:', error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleEditStatus = (userId, taskId, newStatus) => {
    axios
      .put(`http://localhost:3006/task/${userId}/${taskId}`, { status: newStatus })
      .then(() => {
        // Update the task status in the UI
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task._id === taskId) {
              return { ...task, status: newStatus };
            }
            return task;
          })
        );
  
        // Emit a socket.io event to notify the server about the status update
        socket.emit('updateTaskStatus', { taskId, status: newStatus });
  
        
        console.log(`Task status updated - Task ID: ${taskId}, New Status: ${newStatus}`);
      })
      .catch((error) => {
        // Handle errors, e.g., display an error message
        console.error('Error updating the task status:', error);
      });
  };
  

  const handleDeleteTask = (userId, taskId) => {
    axios
      .delete(`http://localhost:3006/task/${userId}/${taskId}`)
      .then(() => {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      })
      .catch((error) => {
        
        console.error('Error deleting the task:', error);
      });
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="lg:w-1/4">
        {user && (
          <div className="p-4">
            <h2 className="text-2xl bg-gray-300 font-bold rounded-lg text-center mb-4">User Profile</h2>
            <div className="flex flex-col ">
              <div className="mb-4 overflow-hidden">
                <img
                  src={`http://localhost:3006/${user.profilePicture}`}
                  alt={`Profile Picture: ${user.username}`}
                  className="w-40 h-40 rounded-full object-cover mx-auto"
                />
              </div>
              <p className="text-xl ">
                <strong>Name:</strong> {user.username}
              </p>
              <p className="text-xl">
                <strong>User ID:</strong> {user._id}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="lg:w-3/4">
        <div className="lg:px-16 lg:pt-5 sm:p-0">
          <h2 className="text-2xl w-52 bg-gray-300 font-bold rounded-lg text-center mb-4">Create New Task</h2>
          <form>
            <div className="mb-2">
              <label className="font-bold">Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 border border-gray-300 rounded focus:outline-none"
                required
              />
            </div>
            <div className="mb-2">
              <label className="font-bold">Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 border border-gray-300 rounded focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTask}
              className="bg-blue-700 text-white py-2 px-4 rounded font-bold cursor-pointer"
            >
              Add Task
            </button>
          </form>
          {successMessage && (
            <div className="text-green-600 mt-4">{successMessage}</div>
          )}
        </div>
        <div className="lg:px-16 lg:pt-10 sm:p-0">
          <h2 className="text-2xl w-48 bg-gray-300 font-bold rounded-lg text-center mb-4">Your Task List</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {tasks.length === 0 && !loading && !error && <p>No tasks found for this user.</p>}
          {tasks.length > 0 && (
            <table className="w-full">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="py-2 text-center border">Task ID</th>
                  <th className="py-2 text-center border">Task Name</th>
                  <th className="py-2 text-center border">Status</th>
                  <th className="py-2 text-center border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="border text-center py-2">{task._id}</td>
                    <td className="border text-center py-2">{task.title}</td>
                    <td className="border text-center py-2">
                      <div className="flex items-center justify-center">
                        {editStatus === task._id ? (
                          // Display dropdown select for editing status
                          <select
                            value={task.status}
                            onChange={(e) => handleEditStatus(user._id, task._id, e.target.value)}
                          >
                            {['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].map(
                              (status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              )
                            )}
                          </select>
                        ) : (
                          // Display status text and "Edit" button
                          <>
                            {task.status}
                            <button
                              className="ml-2 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
                              onClick={() => setEditStatus(task._id)}
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="border text-center mx-auto py-2">
                      <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded mx-1"
                        onClick={() => handleDeleteTask(user._id, task._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDashboard;
