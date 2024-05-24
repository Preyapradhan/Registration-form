import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faEdit } from '@fortawesome/free-solid-svg-icons';

const App = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    qualification: '',
    contactno: '',
    gender: '',
    file: null,
  });

  const [users, setUsers] = useState([]);
  const [error, setError] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditUser = (userId) => {
    setSelectedUserId(userId);
    setIsEditing(true);
    const selectedUser = users.find((user) => user._id === userId);
    if (selectedUser) {
      setFormData({
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        qualification: selectedUser.qualification,
        contactno: selectedUser.contactno,
        gender: selectedUser.gender,
        file: null,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      file: file,
      fileSize: (file.size / 1024).toFixed(2), // Calculate file size in KB and store it in formData
    });
  };

  const validatePhoneNumber = (number) => {
    const phonePattern = /^[0-9]{10}$/;
    return phonePattern.test(number);
  };

  const validateName = (name) => {
    const namePattern = /^[A-Za-z]+$/;
    return namePattern.test(name);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateFileType = (file) => {
    const allowedExtensions = /(\.pdf|\.doc|\.docx|\.xls|\.csv|\.odt)$/i;
    return allowedExtensions.test(file.name);
  };

  const validateFileSize = (file) => {
    const maxSize = 1024 * 1024; // 1MB
    return file.size <= maxSize;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('qualification', formData.qualification);
    data.append('contactno', formData.contactno);
    data.append('gender', formData.gender);
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      if (isEditing && selectedUserId) {
        await axios.put(`http://localhost:5000/api/users/${selectedUserId}`, data);
        setIsEditing(false);
        setSelectedUserId(null);
      } else {
        await axios.post('http://localhost:5000/api/register', data);
      }
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        qualification: '',
        contactno: '',
        gender: '',
        file: null,
      });
      fetchUsers();
    } catch (err) {
      console.error('Error during submission:', err);
    }
  };

  const validateForm = () => {
    let valid = true;
    let formErrors = {};

    if (!validateName(formData.firstName)) {
      formErrors.firstName = 'Please enter characters only for first name';
      valid = false;
    }

    if (!validateName(formData.lastName)) {
      formErrors.lastName = 'Please enter characters only for last name';
      valid = false;
    }

    if (!validatePhoneNumber(formData.contactno)) {
      formErrors.contactno = 'Please enter a valid 10-digit phone number';
      valid = false;
    }

    if (!validateEmail(formData.email)) {
      formErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    if (formData.gender === '') {
      formErrors.gender = 'Gender is required';
      valid = false;
    }

    if (formData.qualification === '') {
      formErrors.qualification = 'Qualification is required';
      valid = false;
    }

    if (!formData.file && !selectedUserId) {
      formErrors.file = 'File upload is required';
      valid = false;
    } else if (formData.file && !validateFileType(formData.file)) {
      formErrors.file = 'Only PDF, doc, docx, and odt files are allowed';
      valid = false;
    } else if (formData.file && !validateFileSize(formData.file)) {
      formErrors.file = 'File size must be less than 1MB';
      valid = false;
    }

    setError(formErrors);
    return valid;
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedUserId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      qualification: '',
      contactno: '',
      gender: '',
      file: null,
    });
    setError({});
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="App">
      <h1>Registration Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First name</label>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          {error.firstName && <p className="error">{error.firstName}</p>}
        </div>
        <div>
          <label>Last name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          {error.lastName && <p className="error">{error.lastName}</p>}
        </div>
        <div>
          <label>Email</label>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {error.email && <p className="error">{error.email}</p>}
        </div>
        <div>
          <label>Qualification</label>
          <input
            type="text"
            name="qualification"
            placeholder="Qualification"
            value={formData.qualification}
            onChange={handleChange}
            required
          />
          {error.qualification && <p className="error">{error.qualification}</p>}
        </div>
        <div>
          <label>Contact number</label>
          <input
            type="text"
            name="contactno"
            placeholder="Contact Number"
            value={formData.contactno}
            onChange={handleChange}
            required
          />
          {error.contactno && <p className="error">{error.contactno}</p>}
        </div>
        <div>
          <label>Gender</label>
          <div className="gender-options">
            <input
              type="radio"
              id="male"
              name="gender"
              value="Male"
              checked={formData.gender === 'Male'}
              onChange={handleChange}
              required
            />
            <label htmlFor="male">Male</label>
            <input
              type="radio"
              id="female"
              name="gender"
              value="Female"
              checked={formData.gender === 'Female'}
              onChange={handleChange}
              required
            />
            <label htmlFor="female">Female</label>
            <input
              type="radio"
              id="other"
              name="gender"
              value="Other"
              checked={formData.gender === 'Other'}
              onChange={handleChange}
              required
            />
            <label htmlFor="other">Other</label>
          </div>
          {error.gender && <p className="error">{error.gender}</p>}
        </div>
        <div>
          <label>Upload File</label>
          <input type="file" name="file" onChange={handleFileChange} required={!selectedUserId} />
          {error.file && <p className="error">{error.file}</p>}
        </div>
        <div>
          <button type="submit">{isEditing ? 'Update' : 'Register'}</button>
          {isEditing && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
        </div>
      </form>

      <h2>Registered Users</h2>
      <div className="user-table">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Name</th>
              <th>Email</th>
              <th>Qualification</th>
              <th>Contact Number</th>
              <th>Gender</th>
              <th>File Size (KB)</th>
              <th>View File</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.qualification}</td>
                <td>{user.contactno}</td>
                <td>{user.gender}</td>
                <td>{user.file.sizeKB}KB</td>
                <td>
                  <a href={`http://localhost:5000/${user.file.path}`} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faEye} />
                  </a>
                </td>
                <td>
                  <FontAwesomeIcon
                    icon={faEdit}
                    onClick={() => handleEditUser(user._id)}
                    className="edit-icon"
                  />
                </td>
                <td>
                  <FontAwesomeIcon icon={faTrashAlt} onClick={() => deleteUser(user._id)} className="delete-button" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
