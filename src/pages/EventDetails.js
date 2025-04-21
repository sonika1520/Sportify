import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetails, joinEvent, leaveEvent, getUserProfileById } from '../api';
import ChatWindow from '../components/ChatWindow';
import GoogleMap from '../components/GoogleMap';
import OpenStreetMap from '../components/OpenStreetMap';
import './EventDetails.css';

// Get Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';

// For debugging - log if API key is missing
if (GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY') {
    console.warn('Please replace YOUR_API_KEY with your actual Google Maps API key.');
}

export default function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isParticipant, setIsParticipant] = useState(false);
    const [isEventOwner, setIsEventOwner] = useState(false);
    const [ownerProfile, setOwnerProfile] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);
    const [participantProfiles, setParticipantProfiles] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                if (!eventId) {
                    setError('Event ID is missing');
                    setLoading(false);
                    return;
                }

                console.log('EventDetails: Fetching details for event ID:', eventId);
                const result = await getEventDetails(eventId);
                console.log('EventDetails: API result:', result);

                if (!result || !result.data) {
                    console.error('EventDetails: Invalid response format:', result);
                    setError('Invalid response from server');
                    setLoading(false);
                    return;
                }

                const eventData = result.data;
                console.log('EventDetails: Event data:', eventData);
                setEvent(eventData);

                // Get current user ID
                const currentUserId = parseInt(localStorage.getItem("userId"));
                console.log('EventDetails: Current user ID:', currentUserId);

                // Check if current user is the event owner
                if (eventData.event_owner === currentUserId) {
                    console.log('EventDetails: User is the event owner');
                    setIsEventOwner(true);
                } else {
                    console.log('EventDetails: User is NOT the event owner');
                    setIsEventOwner(false);

                    // Fetch the owner's profile
                    try {
                        const ownerProfileResult = await getUserProfileById(eventData.event_owner);
                        if (!ownerProfileResult.error) {
                            console.log('EventDetails: Owner profile fetched:', ownerProfileResult);
                            setOwnerProfile(ownerProfileResult.data || ownerProfileResult);
                        }
                    } catch (profileError) {
                        console.error('EventDetails: Error fetching owner profile:', profileError);
                    }
                }

                // Check if current user is a participant
                setIsParticipant(false);
                if (eventData.participants && Array.isArray(eventData.participants)) {
                    console.log('EventDetails: Checking participants:', eventData.participants);
                    const isUserParticipant = eventData.participants.some(p => p.user_id === currentUserId);
                    console.log('EventDetails: Is user participant?', isUserParticipant);
                    setIsParticipant(isUserParticipant);
                }

                setLoading(false);
            } catch (error) {
                console.error('EventDetails: Error fetching event details:', error);
                setError('Failed to load event details: ' + (error.message || 'Unknown error'));
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleJoin = async () => {
        try {
            console.log('EventDetails: Joining event:', eventId);
            setError(null); // Clear any previous errors
            const joinResult = await joinEvent(eventId);
            console.log('EventDetails: Join result:', joinResult);
            setIsParticipant(true);
            alert("Event Joined Successfully!");
            // Refresh event details to update participant count
            console.log('EventDetails: Refreshing event details after join');
            const result = await getEventDetails(eventId);
            if (result && result.data) {
                setEvent(result.data);
            }
        } catch (error) {
            console.error('EventDetails: Error joining event:', error);
            setError('Failed to join event: ' + (error.message || 'Unknown error'));
        }
    };

    const handleLeave = async () => {
        try {
            console.log('EventDetails: Leaving event:', eventId);
            setError(null); // Clear any previous errors
            const leaveResult = await leaveEvent(eventId);
            console.log('EventDetails: Leave result:', leaveResult);
            setIsParticipant(false);

            // Refresh event details to update participant count
            console.log('EventDetails: Refreshing event details after leave');
            const result = await getEventDetails(eventId);
            if (result && result.data) {
                setEvent(result.data);
            }
        } catch (error) {
            console.error('EventDetails: Error leaving event:', error);
            setError('Failed to leave event: ' + (error.message || 'Unknown error'));
        }
    };

    const handleUpdateEvent = () => {
        console.log('EventDetails: Navigating to update event page for event ID:', eventId);
        navigate(`/update-event/${eventId}`);
    };

    const handleShowParticipants = async () => {
        if (!event || !event.participants) return;

        setShowParticipants(true);
        setLoadingParticipants(true);

        try {
            const profiles = [];

            // Fetch profile for each participant
            for (const participant of event.participants) {
                try {
                    const profileResult = await getUserProfileById(participant.user_id);
                    if (!profileResult.error) {
                        profiles.push({
                            userId: participant.user_id,
                            profile: profileResult.data || profileResult
                        });
                    } else {
                        profiles.push({
                            userId: participant.user_id,
                            profile: { first_name: 'Unknown', last_name: 'User' }
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching profile for user ${participant.user_id}:`, error);
                    profiles.push({
                        userId: participant.user_id,
                        profile: { first_name: 'Unknown', last_name: 'User' }
                    });
                }
            }

            setParticipantProfiles(profiles);
        } catch (error) {
            console.error('Error fetching participant profiles:', error);
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleCloseParticipants = () => {
        setShowParticipants(false);
    };

    if (loading) return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
        }}>
            <div style={{
                padding: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                borderRadius: "8px"
            }}>
                <h2>Loading Event Details...</h2>
            </div>
        </div>
    );

    if (error) return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
        }}>
            <div style={{
                padding: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                borderRadius: "8px",
                maxWidth: "600px",
                textAlign: "center"
            }}>
                <h2>Error</h2>
                <p>{error}</p>
                <button
                    onClick={() => navigate('/Home')}
                    style={{
                        marginTop: "15px",
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );

    if (!event) return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
        }}>
            <div style={{
                padding: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                borderRadius: "8px"
            }}>
                <h2>Event Not Found</h2>
                <button
                    onClick={() => navigate('/Home')}
                    style={{
                        marginTop: "15px",
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "20px"
        }}>
            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "white",
                padding: "20px",
                borderRadius: "8px"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h1 style={{ margin: 0 }}>{event.title}</h1>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {isEventOwner && (
                            <button
                                onClick={handleUpdateEvent}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#FF9800",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Update Event
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/Home')}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Back to Home
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    {isEventOwner && (
                        <div style={{
                            backgroundColor: "rgba(255, 152, 0, 0.2)",
                            padding: "10px",
                            borderRadius: "4px",
                            marginBottom: "15px",
                            border: "1px solid #FF9800"
                        }}>
                            <p style={{ margin: 0 }}><strong>You are the owner of this event</strong></p>
                        </div>
                    )}
                    <p>
                        <strong>Date & Time:</strong>{" "}
                        {new Date(event.event_datetime).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        })}
                    </p>
                    <p><strong>Sport:</strong> {event.sport}</p>
                    <p><strong>Location:</strong> {event.location_name}</p>
                    {!isEventOwner && ownerProfile && (
                        <p>
                            <strong>Organized by:</strong> {ownerProfile.first_name} {ownerProfile.last_name}
                        </p>
                    )}
                    {event.latitude && event.longitude && (
                        <div style={{ marginBottom: "15px" }}>
                            <p>
                                <strong>Map:</strong>{" "}
                                <a
                                    href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#4CAF50",
                                        textDecoration: "none",
                                        fontWeight: "bold",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px"
                                    }}
                                >
                                    View on Google Maps
                                    <span style={{ fontSize: "16px" }}>🗺️</span>
                                </a>
                            </p>
                            {/* Map Component - Light Mode */}
                            <div style={{
                                marginTop: "15px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                height: "220px",
                                width: "80%",
                                maxWidth: "600px",
                                border: "1px solid #ddd",
                                backgroundColor: "#fff",
                                margin: "15px auto"
                            }}>
                                {GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY' ? (
                                    <GoogleMap
                                        latitude={event.latitude}
                                        longitude={event.longitude}
                                        apiKey={GOOGLE_MAPS_API_KEY}
                                        locationName={event.location_name}
                                    />
                                ) : (
                                    <OpenStreetMap
                                        latitude={event.latitude}
                                        longitude={event.longitude}
                                        locationName={event.location_name}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                    <p><strong>Maximum Players:</strong> {event.max_players}</p>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                        margin: "15px 0"
                    }}>
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>
                            Current Participants: {event.registered_count || 0}
                        </p>
                        {event.participants && event.participants.length > 0 && (
                            <button
                                onClick={handleShowParticipants}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#2196F3",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}
                            >
                                View Participants List
                            </button>
                        )}
                    </div>
                    <p><strong>Description:</strong> {event.description}</p>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    {isParticipant ? (
                        <button
                            onClick={handleLeave}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                        >
                            Leave Event
                        </button>
                    ) : (
                        <button
                            onClick={handleJoin}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                            disabled={event.is_full}
                        >
                            {event.is_full ? "Event Full" : "Join Event"}
                        </button>
                    )}
                </div>

                {isParticipant && (
                    <div style={{ marginTop: "20px" }}>
                        <h2>Event Chat</h2>
                        <ChatWindow eventId={event.id} isParticipant={true} />
                    </div>
                )}

                {error && (
                    <div style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "rgba(244, 67, 54, 0.7)",
                        borderRadius: "4px"
                    }}>
                        {error}
                    </div>
                )}

                {/* Participants Popup */}
                {showParticipants && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            padding: "20px",
                            maxWidth: "500px",
                            width: "90%",
                            maxHeight: "80vh",
                            overflow: "auto",
                            color: "#333"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                <h2 style={{ margin: 0 }}>Event Participants</h2>
                                <button
                                    onClick={handleCloseParticipants}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "24px",
                                        cursor: "pointer",
                                        color: "#666"
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {loadingParticipants ? (
                                <div style={{ textAlign: "center", padding: "20px" }}>
                                    <p>Loading participants...</p>
                                </div>
                            ) : participantProfiles.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "20px" }}>
                                    <p>No participants found.</p>
                                </div>
                            ) : (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {participantProfiles.map((item, index) => (
                                        <li key={item.userId} style={{
                                            padding: "10px",
                                            borderBottom: index < participantProfiles.length - 1 ? "1px solid #eee" : "none",
                                            display: "flex",
                                            alignItems: "center"
                                        }}>
                                            <div style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                backgroundColor: "#f0f0f0",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginRight: "15px",
                                                fontSize: "18px",
                                                color: "#666"
                                            }}>
                                                {item.profile.first_name ? item.profile.first_name[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: "bold" }}>
                                                    {item.profile.first_name} {item.profile.last_name}
                                                </p>
                                                {item.userId === event.event_owner && (
                                                    <span style={{
                                                        fontSize: "12px",
                                                        backgroundColor: "#FF9800",
                                                        color: "white",
                                                        padding: "2px 6px",
                                                        borderRadius: "10px",
                                                        marginLeft: "5px"
                                                    }}>
                                                        Organizer
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}