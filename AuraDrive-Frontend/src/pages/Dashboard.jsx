import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Car, MapPin, User, LogOut, Send, Edit2, 
    Clock, LayoutDashboard, ChevronRight, 
    CreditCard, CheckCircle, X, Loader2
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import api from '../api/axios';
import CheckoutForm from './CheckoutForm';
import RideReceipt from './RideReceipt';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const stripePromise = loadStripe('pk_test_your_key_here');

const MapRecenter = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.setView([lat, lng], 13);
    }, [lat, lng, map]);
    return null;
};

const Dashboard = () => {
    const navigate = useNavigate();
    
    const [rideData, setRideData] = useState({ pickup: '', destination: '', fare: 0, distance: 0 });
    const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090 }); 
    const [status, setStatus] = useState({ message: '', type: '' });
    const [rides, setRides] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [commentText, setCommentText] = useState({});
    
    const [showPayment, setShowPayment] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    const [receiptData, setReceiptData] = useState(null);

    const isMounted = useRef(true);

    const getAuthConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchRides = useCallback(async () => {
        try {
            const response = await api.get('/rides/my-rides', getAuthConfig());
            if (isMounted.current) setRides(response.data);
        } catch (error) {
            console.error("Fetch error:", error);
            if (isMounted.current) setStatus({ message: 'Session expired or unauthorized.', type: 'error' });
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        fetchRides();
        return () => { isMounted.current = false; };
    }, [fetchRides]);

    // --- Geocoding & Fare Simulation (FIXED) ---
    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            const pickupLen = rideData.pickup?.length || 0;
            const destLen = rideData.destination?.length || 0;

            if (pickupLen > 3) {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${rideData.pickup}`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                    }
                } catch (e) { console.error("Map lookup failed", e); }
            }

            // CRITICAL FIX: Removed !editingId to allow fare updates during editing
            if (pickupLen > 3 && destLen > 3) {
                setIsCalculating(true);
                // Simulating a slight delay for realism
                setTimeout(() => {
                    const simulatedDistance = parseFloat((Math.random() * 20 + 2).toFixed(2));
                    const simulatedFare = Math.floor(simulatedDistance * 15);
                    setRideData(prev => ({ 
                        ...prev, 
                        fare: simulatedFare, 
                        distance: simulatedDistance 
                    }));
                    setIsCalculating(false);
                }, 500);
            }
        }, 1000); 
        
        return () => clearTimeout(debounceTimer);
    }, [rideData.pickup, rideData.destination]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleRideRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ message: 'Processing...', type: 'info' });
        
        try {
            const payload = { 
                pickupLocation: rideData.pickup || "", 
                destination: rideData.destination || "",
                fare: rideData.fare || 0,
                distance: rideData.distance || 0 
            };

            const config = getAuthConfig();

            if (editingId) {
                await api.put(`/rides/${editingId}`, payload, config);
                setStatus({ message: 'Ride updated successfully!', type: 'success' });
            } else {
                await api.post('/rides/request', payload, config);
                setStatus({ message: 'Success! Ride requested.', type: 'success' });
            }

            setRideData({ pickup: '', destination: '', fare: 0, distance: 0 });
            setEditingId(null);
            fetchRides();
        } catch (error) {
            console.error("Request Error:", error);
            const backendMessage = error.response?.data?.message || 'Action failed.';
            setStatus({ message: backendMessage, type: 'error' });
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const handleAddComment = async (rideId) => {
        if (!commentText[rideId]?.trim()) return;
        try {
            await api.post(`/comments/ride/${rideId}`, { content: commentText[rideId] }, getAuthConfig());
            setCommentText(prev => ({ ...prev, [rideId]: '' }));
            fetchRides(); 
        } catch (err) {
            console.error("Comment failed:", err);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        fetchRides();
        setReceiptData({
            ride: selectedRide,
            payment: { 
                amount: selectedRide.fare, 
                status: 'PAID', 
                stripePaymentIntentId: 'pi_demo_' + Date.now() 
            }
        });
    };

    return (
        <>
            <style>{`
                .dash-container { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }
                .sidebar { width: 280px; background: #0f172a; color: white; display: flex; flex-direction: column; }
                .main-content { flex: 1; overflow-y: auto; padding: 40px; scroll-behavior: smooth; }
                .content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px; align-items: start; }
                .card { background: white; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                .map-preview { height: 200px; width: 100%; border-radius: 16px; margin-bottom: 20px; overflow: hidden; border: 1px solid #e2e8f0; z-index: 5; }
                .pay-btn { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; }
                .fare-tag { font-size: 14px; font-weight: 700; color: #10b981; background: #ecfdf5; padding: 10px 14px; border-radius: 12px; margin-top: 12px; display: flex; align-items: center; gap: 8px; border: 1px solid #10b981; width: fit-content; }
                .status-msg.info { color: #3b82f6; background: #eff6ff; padding: 10px; border-radius: 10px; margin-top: 10px; font-size: 13px; }
                .status-msg.success { color: #10b981; background: #f0fdf4; padding: 10px; border-radius: 10px; margin-top: 10px; font-size: 13px; }
                .status-msg.error { color: #ef4444; background: #fef2f2; padding: 10px; border-radius: 10px; margin-top: 10px; font-size: 13px; }
                .form-input { width: 100%; padding: 14px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; }
                .ride-item { padding:20px; background:#f8fafc; border-radius:16px; margin-bottom:15px; border:1px solid #f1f5f9; transition: transform 0.2s; }
                .ride-item:hover { transform: translateY(-2px); border-color: #cbd5e1; }
            `}</style>

            <div className="dash-container">
                <aside className="sidebar">
                    <div style={{padding:'32px', fontSize:'24px', fontWeight:'900', borderBottom:'1px solid #1e293b'}}>Aura<span style={{color:'#3b82f6'}}>Drive</span></div>
                    <nav style={{flex:1, padding:'20px'}}>
                        <button style={{display:'flex', gap:'12px', padding:'12px', background:'#3b82f6', color:'white', border:'none', borderRadius:'12px', width:'100%', cursor:'pointer', fontWeight:'600'}}><LayoutDashboard size={20}/> Rider Dashboard</button>
                    </nav>
                    <button style={{margin:'20px', padding:'16px', background:'#1e293b', color:'#f87171', border:'1px solid #334155', borderRadius:'16px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', fontWeight:'600'}} onClick={handleLogout}>
                        <LogOut size={18}/> Sign Out
                    </button>
                </aside>

                <main className="main-content">
                    <div style={{marginBottom: '30px'}}>
                        <h1 style={{fontSize:'28px', fontWeight:'800', color:'#0f172a'}}>Ride Control Center</h1>
                        <p style={{color:'#64748b'}}>You have {rides.length} journey records in your history.</p>
                    </div>

                    <div className="content-grid">
                        <section className="card">
                            <div className="map-preview">
                                <MapContainer center={[coords.lat, coords.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[coords.lat, coords.lng]} />
                                    <MapRecenter lat={coords.lat} lng={coords.lng} />
                                </MapContainer>
                            </div>

                            <h2 style={{fontSize:'18px', fontWeight:'700', marginBottom:'24px', display:'flex', alignItems:'center', gap:'10px'}}><Send size={20} color="#3b82f6"/> {editingId ? 'Modify Trip' : 'Plan Your Journey'}</h2>
                            
                            <form onSubmit={handleRideRequest}>
                                <div style={{marginBottom:'15px'}}>
                                    <label style={{fontSize:'11px', fontWeight:'800', color:'#94a3b8', display:'block', marginBottom:'5px'}}>PICKUP LOCATION</label>
                                    <input className="form-input" name="pickup" type="text" value={rideData.pickup || ''} onChange={(e) => setRideData({...rideData, pickup: e.target.value})} required placeholder="e.g. India Gate, Delhi" />
                                </div>
                                <div style={{marginBottom:'15px'}}>
                                    <label style={{fontSize:'11px', fontWeight:'800', color:'#94a3b8', display:'block', marginBottom:'5px'}}>DESTINATION</label>
                                    <input className="form-input" name="destination" type="text" value={rideData.destination || ''} onChange={(e) => setRideData({...rideData, destination: e.target.value})} required placeholder="e.g. Airport T3" />
                                </div>

                                {rideData.fare > 0 && (
                                    <div className="fare-tag">
                                        {isCalculating ? <Loader2 size={14} className="animate-spin" /> : null}
                                        Estimated Fare: ₹{rideData.fare}
                                    </div>
                                )}

                                <button type="submit" disabled={loading || isCalculating} style={{width:'100%', padding:'16px', background: editingId ? '#f59e0b' : '#0f172a', color:'white', border:'none', borderRadius:'12px', fontWeight:'700', cursor:'pointer', marginTop:'20px'}}>
                                    {loading ? 'Processing...' : editingId ? 'Update Journey' : 'Request AuraDrive'}
                                </button>
                                
                                {editingId && (
                                    <button type="button" onClick={() => { setEditingId(null); setRideData({pickup:'', destination:'', fare:0, distance:0}); }} style={{width:'100%', background:'none', border:'none', color:'#ef4444', marginTop:'10px', cursor:'pointer', fontWeight:'700'}}>Cancel Edit</button>
                                )}
                            </form>
                            {status.message && <div className={`status-msg ${status.type}`}>{status.message}</div>}
                        </section>

                        <section className="card">
                            <h2 style={{fontSize:'18px', fontWeight:'700', marginBottom:'24px', display:'flex', alignItems:'center', gap:'10px'}}><Clock size={20} color="#3b82f6"/> Recent Activity</h2>
                            <div className="ride-list">
                                {rides.length === 0 ? <p style={{textAlign:'center', color:'#94a3b8', padding: '40px'}}>No activity yet. Request your first ride!</p> : rides.map(ride => (
                                    <div key={ride.id} className="ride-item">
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <div style={{display:'flex', gap:'16px', alignItems:'center'}}>
                                                <div style={{padding:'10px', background:'white', borderRadius:'10px', border:'1px solid #e2e8f0'}}><MapPin size={18} color="#64748b"/></div>
                                                <div>
                                                    <p style={{fontSize:'14px', fontWeight:'700', margin:0}}>{ride.pickupLocation} <ChevronRight size={12} style={{verticalAlign:'middle'}}/> {ride.destination}</p>
                                                    <span style={{fontSize:'11px', fontWeight:'800', color:'#3b82f6', textTransform:'uppercase'}}>{ride.status || 'PENDING'} • ₹{ride.fare}</span>
                                                </div>
                                            </div>
                                            <div style={{display:'flex', gap:'10px'}}>
                                                {ride.status === 'COMPLETED' && (
                                                    <button className="pay-btn" onClick={() => { setSelectedRide(ride); setShowPayment(true); }}>
                                                        <CreditCard size={14}/> Pay Now
                                                    </button>
                                                )}
                                                {ride.status === 'PAID' && <CheckCircle color="#10b981" size={24} />}
                                                {ride.status === 'REQUESTED' && (
                                                    <button style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', padding:'5px'}} 
                                                        onClick={() => { 
                                                            setEditingId(ride.id); 
                                                            setRideData({
                                                                pickup: ride.pickupLocation, 
                                                                destination: ride.destination, 
                                                                fare: ride.fare,
                                                                distance: ride.distance
                                                            }); 
                                                            window.scrollTo({top:0, behavior:'smooth'}); 
                                                        }}>
                                                        <Edit2 size={16}/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px'}}>
                                            <div style={{maxHeight:'80px', overflowY:'auto', marginBottom:'10px'}}>
                                                {ride.comments?.map(c => (
                                                    <div key={c.id} style={{fontSize:'12px', color:'#475569', background:'#f1f5f9', padding:'6px 10px', borderRadius:'8px', marginBottom:'4px'}}>
                                                        <span style={{fontWeight:'700'}}>{c.userName}:</span> {c.content}
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <input type="text" placeholder="Add a note..." value={commentText[ride.id] || ''} onChange={(e) => setCommentText({...commentText, [ride.id]: e.target.value})} style={{flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px'}} />
                                                <button onClick={() => handleAddComment(ride.id)} style={{padding: '8px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>
                                                    <Send size={14}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {showPayment && (
                <div className="modal-overlay">
                    <div className="card" style={{maxWidth:'450px', width:'100%', padding: '40px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'24px'}}>
                            <h3 style={{fontWeight:'800', margin:0}}>Secure Checkout</h3>
                            <button onClick={() => setShowPayment(false)} style={{background:'none', border:'none', cursor:'pointer', color: '#94a3b8'}}><X size={24}/></button>
                        </div>
                        <Elements stripe={stripePromise}>
                            <CheckoutForm rideId={selectedRide.id} amount={selectedRide.fare} onSuccess={handlePaymentSuccess} />
                        </Elements>
                    </div>
                </div>
            )}

            {receiptData && (
                <RideReceipt ride={receiptData.ride} payment={receiptData.payment} onClose={() => setReceiptData(null)} />
            )}
        </>
    );
};

export default Dashboard;