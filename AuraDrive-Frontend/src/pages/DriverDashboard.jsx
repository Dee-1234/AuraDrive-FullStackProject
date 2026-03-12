import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverDashboard } from '../hooks/useDriverDashboard';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { 
    Navigation, LogOut, MapPin, Send, Clock, 
    Zap, TrendingUp, DollarSign, Star, ChevronRight,
    Loader2, CheckCircle, Info, ShieldCheck
} from 'lucide-react';

// --- LEAFLET CONFIGURATION ---
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapRecenter = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) map.setView(coords, 13);
    }, [coords, map]);
    return null;
};

const DriverDashboard = () => {
    // 1. Hook Integration
    const { 
        available = [], 
        active = null, 
        loading = false, 
        commentText = {}, 
        setCommentText, 
        performAction, 
        postComment, 
        setAvailable 
    } = useDriverDashboard();
    
    const navigate = useNavigate();
    const [myLocation] = useState([28.6139, 77.2090]);
    const [lastCompleted, setLastCompleted] = useState(null);
    const [isSurgeMode, setIsSurgeMode] = useState(false);

    // 2. LIVE FETCH LOGIC (Scanning for rides in DB)
    const fetchLiveRequests = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/rides/available', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Ensure we handle both direct arrays or wrapped objects
                const rides = Array.isArray(data) ? data : (data.rides || []);
                setAvailable(rides);
            }
        } catch (error) {
            console.error("Scanning Error:", error);
        }
    }, [setAvailable]);

    useEffect(() => {
        let interval = null;
        if (isSurgeMode) {
            fetchLiveRequests(); // Initial fetch
            interval = setInterval(fetchLiveRequests, 5000); // Poll every 5s
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isSurgeMode, fetchLiveRequests]);

    // 3. Handlers
    const onLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleActionRequest = async (id, action) => {
        const result = await performAction(id, action);
        if (result?.success && action === 'complete') {
            setLastCompleted(active);
            setTimeout(() => setLastCompleted(null), 6000);
        }
        if (result && !result.success) alert(result.message);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="dash-container">
            <style>{`
                .dash-container { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }
                .sidebar { width: 280px; background: #0f172a; color: white; display: flex; flex-direction: column; }
                .main-content { flex: 1; overflow-y: auto; padding: 40px; }
                .content-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 32px; }
                .card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                .surge-glow { box-shadow: 0 0 25px rgba(59, 131, 246, 0.15); border-color: #3b82f6 !important; }
                .stat-card { background: white; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0; }
                .market-item { padding: 20px; background: #f8fafc; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; transition: transform 0.2s; }
                .market-item:hover { transform: translateY(-2px); border-color: #3b82f6; }
                .mission-btn { padding: 16px 32px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; color: white; }
                .btn-start { background: #3b82f6; box-shadow: 0 4px 12px rgba(59, 131, 246, 0.3); }
                .btn-complete { background: #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
                .scanning-box { padding: 50px 20px; text-align: center; border: 2px dashed #cbd5e1; border-radius: 20px; }
                @keyframes pulse-bg { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
                .animate-pulse-slow { animation: pulse-bg 3s infinite; }
            `}</style>

            <aside className="sidebar">
                <div style={{padding:'32px', fontSize:'24px', fontWeight:'900', borderBottom:'1px solid #1e293b'}}>Aura<span style={{color:'#3b82f6'}}>Drive</span></div>
                <nav style={{flex:1, padding:'20px'}}>
                    <div style={{display:'flex', gap:'12px', padding:'14px', background:'#3b82f6', color:'white', borderRadius:'12px', fontWeight:'600'}}><Navigation size={20}/> Driver Console</div>
                </nav>
                <button onClick={onLogout} style={{margin:'20px', padding:'16px', background:'#1e293b', color:'#f87171', border:'1px solid #334155', borderRadius:'16px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', fontWeight:'600'}}>
                    <LogOut size={18}/> Go Offline
                </button>
            </aside>

            <main className="main-content">
                <header style={{marginBottom: '30px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                        <h1 style={{fontSize:'28px', fontWeight:'800', color:'#0f172a'}}>Mission Control</h1>
                        <p style={{color:'#64748b'}}>Radar Status: <span style={{color: isSurgeMode ? '#3b82f6' : '#94a3b8', fontWeight:'700'}}>{isSurgeMode ? '● SCANNING DB' : '○ STANDBY'}</span></p>
                    </div>
                    <button 
                        onClick={() => setIsSurgeMode(!isSurgeMode)} 
                        style={{ padding: '12px 24px', background: isSurgeMode ? '#3b82f6' : '#f1f5f9', color: isSurgeMode ? 'white' : '#64748b', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Zap size={16} fill={isSurgeMode ? "white" : "none"} />
                        {isSurgeMode ? 'STOP SCANNING' : 'START LIVE SCAN'}
                    </button>
                </header>

                <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'20px', marginBottom:'32px'}}>
                    <StatCard icon={<DollarSign size={20} color="#10b981"/>} label="Earnings" value="₹1,240" />
                    <StatCard icon={<TrendingUp size={20} color="#3b82f6"/>} label="Rides" value="14" />
                    <StatCard icon={<Star size={20} color="#f59e0b"/>} label="Rating" value="4.9" />
                    <StatCard icon={<Clock size={20} color="#8b5cf6"/>} label="Online" value="4h 20m" />
                </div>

                <div className="content-grid">
                    <section className="card">
                        <div style={{height:'380px', position:'relative'}}>
                            <MapContainer center={myLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Circle center={myLocation} radius={1500} pathOptions={{fillColor: '#3b82f6', color: '#3b82f6', fillOpacity: 0.1}} />
                                <Marker position={myLocation} />
                                <MapRecenter coords={myLocation} />
                            </MapContainer>
                        </div>
                        <div style={{ padding: '32px' }}>
                            {lastCompleted ? <CompletionOverlay ride={lastCompleted} onClose={() => setLastCompleted(null)} /> : 
                             active ? <ActiveTripView ride={active} onAction={handleActionRequest} commentValue={commentText[active.id] || ''} onCommentChange={(val) => setCommentText({...commentText, [active.id]: val})} onCommentSubmit={() => postComment(active.id)} /> : 
                             <EmptyState />}
                        </div>
                    </section>

                    <section className={`card ${isSurgeMode ? 'surge-glow' : ''}`} style={{padding: '32px'}}>
                        <h2 style={{fontSize:'18px', fontWeight:'700', marginBottom:'24px', display:'flex', alignItems:'center', gap:'10px'}}>
                            <ShieldCheck size={20} color={isSurgeMode ? "#3b82f6" : "#94a3b8"}/> Nearby Rides
                        </h2>
                        <div style={{maxHeight:'500px', overflowY:'auto'}}>
                            {available.length === 0 ? (
                                <div className="scanning-box">
                                    <Loader2 className={isSurgeMode ? "animate-spin" : ""} size={32} color="#cbd5e1" style={{margin:'0 auto 16px'}} />
                                    <p style={{fontSize:'12px', fontWeight:'800', color:'#94a3b8'}}>{isSurgeMode ? 'FETCHING FROM DATABASE...' : 'RADAR OFFLINE'}</p>
                                </div>
                            ) : (
                                available.map(ride => (
                                    <div key={ride.id} className="market-item">
                                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                            <span style={{fontSize:'11px', fontWeight:'800', color:'#94a3b8'}}>{ride.riderName}</span>
                                            <span style={{fontSize:'11px', fontWeight:'800', color:'#3b82f6'}}>{ride.distance} KM</span>
                                        </div>
                                        <p style={{fontSize:'14px', fontWeight:'700', marginBottom:'15px'}}>{ride.pickupLocation} → {ride.destination}</p>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <span style={{fontSize:'18px', fontWeight:'900'}}>₹{ride.fare}</span>
                                            <button onClick={() => handleActionRequest(ride.id, 'accept')} disabled={!!active} style={{padding:'8px 20px', background: active ? '#e2e8f0' : '#0f172a', color: active ? '#94a3b8' : 'white', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer'}}>
                                                {active ? 'Busy' : 'Accept'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ icon, label, value }) => (
    <div className="stat-card">
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
            {icon} <span style={{fontSize:'11px', fontWeight:'800', color:'#94a3b8'}}>{label}</span>
        </div>
        <div style={{fontSize:'22px', fontWeight:'900'}}>{value}</div>
    </div>
);

const EmptyState = () => (
    <div style={{textAlign:'center', padding:'20px 0'}}>
        <Navigation className="animate-pulse-slow" size={32} color="#3b82f6" style={{margin:'0 auto 16px'}}/>
        <h3 style={{fontWeight:'800'}}>Ready for Duty</h3>
        <p style={{color:'#64748b', fontSize:'14px'}}>Requests will appear here as they arrive.</p>
    </div>
);

const CompletionOverlay = ({ ride, onClose }) => (
    <div style={{textAlign:'center', padding:'20px'}}>
        <div style={{width:'60px', height:'60px', background:'#dcfce7', color:'#10b981', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px'}}><CheckCircle size={30}/></div>
        <h2 style={{fontWeight:'900'}}>Ride Completed!</h2>
        <p style={{fontSize:'24px', fontWeight:'900', color:'#10b981', margin:'10px 0'}}>₹{ride.fare}</p>
        <button onClick={onClose} style={{padding:'10px 30px', background:'#0f172a', color:'white', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'700'}}>Back to Console</button>
    </div>
);

const ActiveTripView = ({ ride, onAction, commentValue, onCommentChange, onCommentSubmit }) => (
    <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px'}}>
            <div>
                <span style={{padding:'4px 10px', background:'#0f172a', color:'white', borderRadius:'6px', fontSize:'10px', fontWeight:'800'}}>ON MISSION</span>
                <h2 style={{fontSize:'36px', fontWeight:'900', margin:'5px 0'}}>₹{ride.fare}</h2>
            </div>
            <button 
                onClick={() => onAction(ride.id, ride.status === 'ACCEPTED' ? 'start' : 'complete')}
                className={`mission-btn ${ride.status === 'ACCEPTED' ? 'btn-start' : 'btn-complete'}`}
            >
                {ride.status === 'ACCEPTED' ? 'START TRIP' : 'COMPLETE RIDE'}
            </button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div style={{background:'#f8fafc', padding:'20px', borderRadius:'16px', border:'1px solid #f1f5f9'}}>
                <div style={{marginBottom:'10px'}}><p style={{fontSize:'10px', fontWeight:'800', color:'#94a3b8', margin:0}}>PICKUP</p><p style={{fontSize:'13px', fontWeight:'700', margin:0}}>{ride.pickupLocation}</p></div>
                <div><p style={{fontSize:'10px', fontWeight:'800', color:'#94a3b8', margin:0}}>DROPOFF</p><p style={{fontSize:'13px', fontWeight:'700', margin:0}}>{ride.destination}</p></div>
            </div>
            <div style={{background:'#f1f5f9', borderRadius:'16px', padding:'15px', display:'flex', flexDirection:'column', height:'140px'}}>
                <div style={{flex:1, overflowY:'auto', fontSize:'12px', marginBottom:'10px'}}>
                    {ride.comments?.map(c => (
                        <div key={c.id} style={{textAlign: c.userRole === 'DRIVER' ? 'right' : 'left', marginBottom:'4px'}}>
                            <span style={{padding:'4px 8px', borderRadius:'8px', background: c.userRole==='DRIVER' ? '#3b82f6':'white', color: c.userRole==='DRIVER' ? 'white':'black'}}>{c.content}</span>
                        </div>
                    ))}
                </div>
                <div style={{display:'flex', gap:'5px'}}>
                    <input style={{flex:1, border:'1px solid #e2e8f0', borderRadius:'6px', padding:'4px 8px'}} placeholder="Chat..." value={commentValue} onChange={(e) => onCommentChange(e.target.value)} />
                    <button onClick={onCommentSubmit} style={{background:'#0f172a', color:'white', border:'none', borderRadius:'6px', padding:'4px 8px'}}><Send size={14}/></button>
                </div>
            </div>
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc'}}>
        <Loader2 className="animate-spin" size={40} color="#3b82f6" />
        <p style={{marginTop:'15px', fontWeight:'700', color:'#64748b'}}>Syncing with Network...</p>
    </div>
);

export default DriverDashboard;