import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const RideHistory = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/api/rides/my-rides');
                // Sort by newest first
                const sortedRides = response.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setRides(sortedRides);
            } catch (error) {
                console.error("Error fetching ride history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleDownload = async (rideId) => {
        try {
            const response = await api.get(`/rides/${rideId}/receipt`);
            const { ride, payment } = response.data;

            const receiptContent = `
                AURADRIVE OFFICIAL RECEIPT
                --------------------------
                Receipt ID: ${payment.id}
                Date: ${new Date(ride.createdAt).toLocaleString()}
                
                RIDER: ${ride.rider.name}
                DRIVER: ${ride.driver ? ride.driver.user.name : 'N/A'}
                
                TRIP DETAILS:
                From: ${ride.pickupLocation}
                To: ${ride.destination}
                Distance: ${ride.distance} km
                
                FARE BREAKDOWN:
                Base Fare: ₹${ride.fare}
                Tax/Fees: ₹0.00
                TOTAL PAID: ₹${ride.fare} (${payment.status})
                --------------------------
                Thank you for choosing AuraDrive!
            `;

            const blob = new Blob([receiptContent], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `AuraDrive_Receipt_${rideId}.txt`;
            link.click();
        } catch (error) {
        console.error("Receipt download failed:", error);
        const message = error.response?.data?.message || "Payment record not found for this ride yet.";
        alert(message);
        }
    };

    if (loading) return <div style={styles.loading}>Loading your history...</div>;

    return (
        <div style={styles.container}>
            <h3>Your Trip History</h3>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Route</th>
                            <th style={styles.th}>Fare</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rides.map(ride => (
                            <tr key={ride.id} style={styles.tr}>
                                <td style={styles.td}>{new Date(ride.createdAt).toLocaleDateString()}</td>
                                <td style={styles.td}>
                                    <div style={styles.route}>
                                        <span style={styles.pickup}>●</span> {ride.pickupLocation}
                                    </div>
                                    <div style={styles.route}>
                                        <span style={styles.dest}>▼</span> {ride.destination}
                                    </div>
                                </td>
                                <td style={styles.td}>₹{ride.fare}</td>
                                <td style={styles.td}>
                                    <span style={{...styles.status, ...statusColors[ride.status]}}>
                                        {ride.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {ride.status === 'COMPLETED' && (
                                        <button onClick={() => handleDownload(ride.id)} style={styles.btn}>
                                            Receipt
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- STYLING ---
const statusColors = {
    COMPLETED: { backgroundColor: '#def7ec', color: '#03543f' },
    CANCELLED: { backgroundColor: '#fde8e8', color: '#9b1c1c' },
    REQUESTED: { backgroundColor: '#e1effe', color: '#1e429f' },
    ACCEPTED: { backgroundColor: '#fef3c7', color: '#92400e' },
};

const styles = {
    container: { padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #edf2f7', color: '#4a5568', fontSize: '14px' },
    td: { padding: '12px', borderBottom: '1px solid #edf2f7', fontSize: '14px', verticalAlign: 'middle' },
    route: { fontSize: '12px', marginBottom: '4px' },
    pickup: { color: '#48bb78', marginRight: '5px' },
    dest: { color: '#f56565', marginRight: '5px' },
    status: { padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
    btn: { padding: '6px 12px', backgroundColor: '#edf2f7', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    loading: { textAlign: 'center', padding: '50px', color: '#666' }
};

export default RideHistory;