import React from 'react';
import api from '../api/axios';

const PaymentSuccess = ({ rideId, fare }) => {
    
    const downloadReceipt = async () => {
        try {
            const response = await api.get(`/rides/${rideId}/receipt`);
            const data = response.data;

            // Simple logic to "download" as a text file for the demo
            const receiptText = `
                AURADRIVE RECEIPT
                -----------------
                Ride ID: ${data.ride.id}
                Pickup: ${data.ride.pickupLocation}
                Destination: ${data.ride.destination}
                Fare: ${data.ride.currency} ${data.ride.fare}
                Date: ${new Date(data.ride.createdAt).toLocaleDateString()}
                Status: ${data.payment.status}
                -----------------
                Thank you for riding with AuraDrive!
            `;

            const element = document.createElement("a");
            const file = new Blob([receiptText], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = `Receipt_Ride_${rideId}.txt`;
            document.body.appendChild(element);
            element.click();
        } catch (error) {
            console.error("Failed to fetch receipt", error);
            alert("Could not generate receipt at this time.");
        }
    };

    return (
        <div style={styles.successContainer}>
            <div style={styles.icon}>✔</div>
            <h2>Payment Successful!</h2>
            <p>Your trip has been completed. The total fare was <strong>₹{fare}</strong>.</p>
            
            <div style={styles.buttonGroup}>
                <button style={styles.receiptBtn} onClick={downloadReceipt}>
                    📄 Download Receipt
                </button>
                <button style={styles.homeBtn} onClick={() => window.location.href = '/dashboard'}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

const styles = {
    successContainer: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f0fff4',
        borderRadius: '16px',
        border: '1px solid #c6f6d5',
        marginTop: '20px'
    },
    icon: {
        fontSize: '50px',
        color: '#38a169',
        marginBottom: '10px'
    },
    buttonGroup: {
        marginTop: '20px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'center'
    },
    receiptBtn: {
        backgroundColor: '#4a5568',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    homeBtn: {
        backgroundColor: '#3182ce',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer'
    }
};

export default PaymentSuccess;