import React, { useState } from 'react';
import api from '../api/axios';

const RideRequest = () => {
    const [rideData, setRideData] = useState({ pickup: '', destination: '' });
    // 1. Loading state is now initialized
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        // 2. Set loading to true immediately
        setLoading(true);
        try {
            const response = await api.post('/rides/request', rideData);
            alert('Ride Requested! ID: ' + response.data.id);
            // Optionally clear form here: setRideData({ pickup: '', destination: '' });
        } catch (error) {
            console.error('Ride Error:', error);
            alert('Failed to request ride. Please try again.');
        } finally {
            // 3. Set loading back to false so the user can try again if it fails
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white shadow rounded-lg max-w-lg mx-auto mt-10">
            <h2 className="text-xl font-bold mb-4">Request a Ride</h2>
            <form onSubmit={handleRequest} className="space-y-4">
                <input 
                    className="w-full p-2 border rounded" 
                    placeholder="Pickup Location" 
                    value={rideData.pickup}
                    onChange={(e) => setRideData({...rideData, pickup: e.target.value})} 
                    required
                />
                <input 
                    className="w-full p-2 border rounded" 
                    placeholder="Destination" 
                    value={rideData.destination}
                    onChange={(e) => setRideData({...rideData, destination: e.target.value})} 
                    required
                />
                {/* 4. Use the loading state to disable the button and change text */}
                <button 
                    type="submit"
                    disabled={loading} 
                    className={`w-full py-2 rounded font-bold text-white transition-colors ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {loading ? "Processing..." : "Confirm Ride"}
                </button>
            </form>
        </div>
    );
};

export default RideRequest;