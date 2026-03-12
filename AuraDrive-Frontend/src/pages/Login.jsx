import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        // Clear storage to ensure a clean login
        localStorage.clear();

        try {
            // Using '/auth/login' to avoid the double /api/api error
            const response = await api.post('/auth/login', credentials);
            
            const { token, role } = response.data;

            if (!token) {
                throw new Error("No token received");
            }

            // Save essential data
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            // Role-based Navigation logic
            const userRole = role ? role.toString().toUpperCase() : "";

            if (userRole.includes('driver')) {
                navigate('/driver-dashboard');
            } else {
                // Riders go to the main Dashboard
                navigate('/dashboard'); 
            }

        } catch (err) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || "Invalid email or password.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.card}>
                <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Welcome Back</h2>
                
                {error && <div style={styles.errorAlert}>{error}</div>}
                
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email Address" 
                    onChange={handleChange} 
                    required 
                    style={styles.input} 
                />
                
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    onChange={handleChange} 
                    required 
                    style={styles.input} 
                />

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                </button>
                
                <p style={{ marginTop: '20px', fontSize: '14px', color: '#718096' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
                </p>
            </form>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f7fafc' },
    card: { padding: '40px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '380px', textAlign: 'center' },
    input: { width: '100%', padding: '14px', margin: '10px 0', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '15px' },
    button: { width: '100%', padding: '14px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' },
    errorAlert: { padding: '10px', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '8px', border: '1px solid #feb2b2', fontSize: '13px', marginBottom: '15px' }
};

export default Login;