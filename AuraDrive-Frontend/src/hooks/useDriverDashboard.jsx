import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

export const useDriverDashboard = () => {
    const [state, setState] = useState({
        available: [],
        active: null,
        loading: true,
        error: null
    });
    const [commentText, setCommentText] = useState({});
    const isMounted = useRef(true);

    const syncData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Use functional update to avoid lint issues if necessary, 
            // though here we are just setting state based on a check.
            setState(prev => ({ ...prev, error: "Auth session missing", loading: false }));
            return;
        }

        try {
            const [myRidesRes, marketRes] = await Promise.all([
                api.get('/rides/my-rides'),
                api.get('/rides/available')
            ]);
            
            if (!isMounted.current) return;

            const active = myRidesRes.data.find(r => 
                ['ACCEPTED', 'ONGOING'].includes(r.status)
            );

            setState(prev => ({
                ...prev,
                active: active || null,
                available: marketRes.data || [],
                loading: false,
                error: null
            }));
        } catch (err) {
            if (isMounted.current) {
                const status = err.response?.status;
                setState(prev => ({ 
                    ...prev, 
                    error: status === 403 ? "Session expired" : "Network sync failed", 
                    loading: false 
                }));
            }
        }
    }, []);

    // FIX FOR ESLINT WARNING
    useEffect(() => {
        isMounted.current = true;
        
        // Define an IIFE (Immediately Invoked Function Expression) 
        // or a named helper inside to isolate the call
        const initializeDashboard = async () => {
            await syncData();
        };

        initializeDashboard();

        const interval = setInterval(() => {
            syncData();
        }, 5000);

        return () => {
            isMounted.current = false;
            clearInterval(interval);
        };
    }, [syncData]);

    const performAction = async (rideId, action) => {
        try {
            await api.put(`/rides/${rideId}/${action}`);
            await syncData(); 
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || `Could not ${action} ride.`;
            return { success: false, message };
        }
    };

    const postComment = async (rideId) => {
        const content = commentText[rideId]?.trim();
        if (!content) return;

        try {
            await api.post(`/comments/ride/${rideId}`, { content });
            setCommentText(prev => ({ ...prev, [rideId]: '' }));
            await syncData();
        } catch (err) {
            console.error("Message delivery failed:", err);
        }
    };

    return { 
        ...state, 
        commentText, 
        setCommentText, 
        performAction, 
        postComment 
    };
};