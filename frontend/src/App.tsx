import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  workExperience: string;
  resume: File | null;
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CandidateFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    workExperience: '',
    resume: null
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, resume: file }));
    if (errors.resume) {
      setErrors(prev => ({ ...prev, resume: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (formData.resume) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(formData.resume.type)) {
        newErrors.resume = 'Only PDF and DOCX files are allowed';
      } else if (formData.resume.size > 5 * 1024 * 1024) {
        newErrors.resume = 'File size must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('education', formData.education);
    data.append('workExperience', formData.workExperience);
    if (formData.resume) {
      data.append('resume', formData.resume);
    }

    try {
      await axios.post('http://localhost:3010/api/candidates', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Candidate added successfully!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        education: '',
        workExperience: '',
        resume: null
      });
      setShowForm(false);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'An error occurred while adding the candidate.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>LTI - Talent Tracking System</h1>
        {!showForm ? (
          <div>
            <h2>Recruiter Dashboard</h2>
            <button onClick={() => setShowForm(true)}>Add Candidate</button>
          </div>
        ) : (
          <div>
            <h2>Add New Candidate</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
              </div>
              <div>
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
              </div>
              <div>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div>
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="education">Education</label>
                <textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="workExperience">Work Experience</label>
                <textarea
                  id="workExperience"
                  name="workExperience"
                  value={formData.workExperience}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="resume">Resume (PDF or DOCX, max 5MB)</label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
                {errors.resume && <span className="error">{errors.resume}</span>}
              </div>
              <button type="submit">Add Candidate</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        )}
        {message && <p>{message}</p>}
      </header>
    </div>
  );
}

export default App;
