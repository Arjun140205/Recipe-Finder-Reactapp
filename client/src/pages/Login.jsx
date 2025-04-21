import { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      // Dispatch a storage event to update navbar state
      window.dispatchEvent(new Event('storage'));
      toast.success('Successfully logged in! 👋');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '40px auto', 
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            style={{ 
              width: '100%', 
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              transition: 'all 0.2s ease'
            }}
            onFocus={e => e.target.style.borderColor = '#e67e22'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            style={{ 
              width: '100%', 
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              transition: 'all 0.2s ease'
            }}
            onFocus={e => e.target.style.borderColor = '#e67e22'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
            required
          />
        </div>
        {error && (
          <div style={{ 
            color: '#e74c3c',
            marginBottom: '15px',
            padding: '8px',
            backgroundColor: '#fde8e8',
            borderRadius: '4px',
            animation: 'shake 0.5s ease'
          }}>
            {error}
          </div>
        )}
        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = '#d35400';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = '#e67e22';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Login
        </button>
      </form>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;
