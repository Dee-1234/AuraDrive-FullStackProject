import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'RIDER' 
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Success message state
    const [loading, setLoading] = useState(false); // Spinner state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            // Note: Ensure your axios base URL handles the "/api" prefix
            const response = await api.post('/auth/register', formData);
            
            setMessage(response.data.message || "Registration successful!");
            setLoading(false);

            // Wait 2 seconds so the user can see the success message, then redirect
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setLoading(false);
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            setError(msg); 
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={{ margin: '0', fontWeight: 'bold' }}>Create Account</h2>
                    <p style={{ color: '#718096', fontSize: '14px' }}>Join the AuraDrive community</p>
                </div>

                {/* Conditional Alerts */}
                {error && <div style={styles.errorAlert}>{error}</div>}
                {message && <div style={styles.successAlert}>{message}</div>}
                
                <form onSubmit={handleRegister}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input type="text" name="name" placeholder="John Doe" onChange={handleChange} required style={styles.input} />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input type="email" name="email" placeholder="john@example.com" onChange={handleChange} required style={styles.input} />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required style={styles.input} />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>I want to join as a...</label>
                        <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
                            <option value="RIDER">Rider (Book Rides)</option>
                            <option value="DRIVER">Driver (Offer Rides)</option>
                        </select>
                    </div>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                    
                    <div style={styles.linkText}>
                        Already have an account? <Link to="/login" style={{ color: '#3182ce', fontWeight: '600' }}>Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f4f8' },
    card: { padding: '40px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '400px' },
    header: { textAlign: 'center', marginBottom: '25px' },
    formGroup: { marginBottom: '15px', textAlign: 'left' },
    label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', textTransform: 'uppercase', marginBottom: '5px', marginLeft: '2px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px' },
    button: { width: '100%', padding: '14px', backgroundColor: '#2d3748', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '16px', transition: '0.3s' },
    errorAlert: { padding: '10px', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '8px', border: '1px solid #feb2b2', fontSize: '14px', marginBottom: '15px', textAlign: 'center' },
    successAlert: { padding: '10px', backgroundColor: '#f0fff4', color: '#2f855a', borderRadius: '8px', border: '1px solid #9ae6b4', fontSize: '14px', marginBottom: '15px', textAlign: 'center' },
    linkText: { marginTop: '20px', fontSize: '14px', color: '#718096', textAlign: 'center' }
};

export default Register;