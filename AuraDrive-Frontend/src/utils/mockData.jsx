export const generateMockRide = () => {
    const locations = ["Connaught Place", "Cyber City", "Hauz Khas", "Noida Sec-62", "Aerocity"];
    const riders = ["Aarav Sharma", "Priya Singh", "Vikram Malhotra", "Ananya Iyer"];
    
    return {
        id: Math.floor(Math.random() * 10000),
        riderName: riders[Math.floor(Math.random() * riders.length)],
        pickupLocation: locations[Math.floor(Math.random() * locations.length)],
        destination: locations[Math.floor(Math.random() * locations.length)],
        fare: Math.floor(Math.random() * (800 - 200) + 200), // ₹200 to ₹800
        distance: (Math.random() * (15 - 2) + 2).toFixed(1), // 2km to 15km
        status: 'REQUESTED',
        comments: []
    };
};