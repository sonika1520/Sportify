import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getUserJoinedEvents, getUserCreatedEvents, leaveEvent, deleteEvent } from "../api";
import "./Main.css";
import "./MyProfile.css";

export default function MyProfile() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [createdEvents, setCreatedEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [createdEventsLoading, setCreatedEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState("");
    const [createdEventsError, setCreatedEventsError] = useState("");
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Check if user has a profile only once when component mounts
    useEffect(() => {
        const checkProfileOnce = async () => {
            console.log('MyProfile component: Performing one-time profile check');

            // Skip check if we've already done it in this session
            if (sessionStorage.getItem('profileCheckDone') === 'true') {
                console.log('MyProfile component: Profile check already done in this session');
                setInitialCheckDone(true);
                return;
            }

            try {
                // Try to get the user profile
                const response = await fetch('http://localhost:8080/v1/profile/0', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.status === 404) {
                    // User doesn't have a profile
                    console.log('MyProfile component: User has no profile, redirecting to profile creation');
                    navigate('/profile');
                    return;
                }

                // If we get here, user has a profile or there was a different error
                // Either way, we'll allow them to stay on the profile page
                console.log('MyProfile component: User has a profile or there was a non-404 error');
                sessionStorage.setItem('profileCheckDone', 'true');
            } catch (error) {
                console.error('MyProfile component: Error checking profile:', error);
                // On error, we'll still let them stay on the profile page
            }

            setInitialCheckDone(true);
        };

        checkProfileOnce();
    }, [navigate]);

    // Function to fetch profile data
    const fetchProfile = async () => {
        setLoading(true);
        try {
            console.log('MyProfile component: Fetching profile data');
            const result = await getUserProfile();
            console.log('MyProfile component: Profile data from API:', result);

            if (!result.error) {
                // Check if the result has a data property (from API response)
                const profile = result.data || result;
                setProfileData(profile);
                setError(''); // Clear any previous errors
            } else {
                console.error('MyProfile component: Error in profile data:', result.error);
                setError(result.error);
            }
        } catch (err) {
            console.error('MyProfile component: Error fetching profile:', err);
            setError('Failed to load profile data: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch profile data after initial check is done
    useEffect(() => {
        if (!initialCheckDone) {
            console.log('MyProfile component: Waiting for profile check before fetching data');
            return;
        }

        console.log('MyProfile component: Initial check done, now fetching profile data');
        fetchProfile();
    }, [initialCheckDone]);

    // Function to fetch joined events
    const fetchJoinedEvents = async () => {
        setEventsLoading(true);
        try {
            console.log('MyProfile: Fetching joined events');
            const result = await getUserJoinedEvents();
            console.log('MyProfile: Joined events from API:', result);
            setJoinedEvents(result.data || []);
            setEventsError(''); // Clear any previous errors
        } catch (err) {
            console.error('MyProfile: Error fetching joined events:', err);
            setEventsError('Failed to load joined events: ' + (err.message || 'Unknown error'));
        } finally {
            setEventsLoading(false);
        }
    };

    // Function to fetch created events
    const fetchCreatedEvents = async () => {
        setCreatedEventsLoading(true);
        try {
            console.log('MyProfile: Fetching created events');
            const result = await getUserCreatedEvents();
            console.log('MyProfile: Created events from API:', result);
            setCreatedEvents(result.data || []);
            setCreatedEventsError(''); // Clear any previous errors
        } catch (err) {
            console.error('MyProfile: Error fetching created events:', err);
            setCreatedEventsError('Failed to load created events: ' + (err.message || 'Unknown error'));
        } finally {
            setCreatedEventsLoading(false);
        }
    };

    // Fetch events after initial check is done
    useEffect(() => {
        if (!initialCheckDone) {
            console.log('MyProfile component: Waiting for profile check before fetching events');
            return;
        }

        console.log('MyProfile component: Initial check done, now fetching events');
        fetchJoinedEvents();
        fetchCreatedEvents();
    }, [initialCheckDone]);

    // Handle leaving an event
    const handleLeaveEvent = async (eventId) => {
        try {
            console.log('MyProfile: Leaving event with ID:', eventId);
            const result = await leaveEvent(eventId);
            console.log('MyProfile: Leave event result:', result);

            // Refresh the joined events list
            await fetchJoinedEvents();

            // Show success message
            alert('Successfully left the event!');
        } catch (err) {
            console.error('MyProfile: Error leaving event:', err);
            alert('Failed to leave event: ' + (err.message || 'Unknown error'));
        }
    };

    // Handle deleting an event
    const handleDeleteEvent = async (eventId) => {
        // Confirm deletion
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            console.log('MyProfile: Deleting event with ID:', eventId);
            const result = await deleteEvent(eventId);
            console.log('MyProfile: Delete event result:', result);

            // Refresh the created events list
            await fetchCreatedEvents();

            // Show success message
            alert('Successfully deleted the event!');
        } catch (err) {
            console.error('MyProfile: Error deleting event:', err);
            alert('Failed to delete event: ' + (err.message || 'Unknown error'));
        }
    };

    // Handle navigation
    const handleNavigate = (path) => {
        console.log('MyProfile: Navigating to:', path);
        navigate(path);
    };

    // Handle view event details
    const handleViewEvent = (eventId) => {
        console.log('MyProfile: Viewing event details for event ID:', eventId);
        navigate(`/events/${eventId}`);
    };

    // Handle update event
    const handleUpdateEvent = (eventId) => {
        console.log('MyProfile: Navigating to update event page for event ID:', eventId);
        navigate(`/update-event/${eventId}`);
    };

    // Show loading indicator while initial profile check is in progress
    if (!initialCheckDone) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundImage: "url('/sports.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}>
                <div style={{
                    padding: "20px",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    borderRadius: "8px",
                    textAlign: "center"
                }}>
                    <h2>Loading...</h2>
                    <p>Checking your profile status</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed" // This ensures the background stays fixed while scrolling
        }}>
            {/* Navigation Bar */}
            <nav style={{
                background: 'black',
                height: '60px',
                display: 'flex',
                padding: '0px',
                flexDirection: 'row'
            }} className="navbar">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '40%',
                    backgroundColor: 'black',
                }}>
                    <img style={{ width: "50px", paddingRight: "10px" }} src="/iconmain.png" alt={"sportify"} />
                    <p style={{
                        margin: '0',
                        padding: '0',
                        color: 'white',
                        fontSize: '40px',
                        fontFamily: 'initial'
                    }}>
                        SPORT!FY
                    </p>
                </div>
                <div style={{ flex: 2, display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }} className="flex">
                    <div style={{ flex: 3, height: '100%', width: '100%' }}><button className="button" onClick={() => handleNavigate("/Home")}>Home</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => handleNavigate("/MyProfile")}>Profile</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}>
                        <button
                            className="button"
                            onClick={() => handleNavigate("/create-event")}
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                padding: '0 20px'
                            }}
                        >
                            +
                        </button>
                    </div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}>
                        <button className="button" id="but3" onClick={() => {
                            localStorage.removeItem("token");
                            handleNavigate("/login");
                        }}>Sign Out</button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {/* Profile Card */}
                <div style={{
                    backgroundColor: "white",
                    marginTop: "50px",
                    marginBottom: "50px",
                    padding: "30px",
                    borderRadius: "15px",
                    width: "80%",
                    maxWidth: "800px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ textAlign: "center", marginBottom: "30px" }}>My Profile</h2>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <p>Loading profile data...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
                            <p>{error}</p>
                            <button
                                onClick={() => handleNavigate("/Profile")}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginTop: "20px"
                                }}
                            >
                                Create Profile
                            </button>
                        </div>
                    ) : profileData ? (
                        <div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                                <div style={{ flex: "1", minWidth: "300px" }}>
                                    <h3>Personal Information</h3>
                                    <div style={{ marginBottom: "15px" }}>
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>Name</p>
                                        <p>{profileData.first_name} {profileData.last_name}</p>
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>Email</p>
                                        <p>{profileData.email}</p>
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>Age</p>
                                        <p>{profileData.age}</p>
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>Gender</p>
                                        <p>{profileData.gender}</p>
                                    </div>
                                </div>

                                <div style={{ flex: "1", minWidth: "300px" }}>
                                    <h3>Sports Preferences</h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                        {profileData.sport_preference && profileData.sport_preference.map((sport, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    backgroundColor: "#f0f0f0",
                                                    padding: "5px 10px",
                                                    borderRadius: "15px",
                                                    display: "inline-block"
                                                }}
                                            >
                                                {sport}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Joined Events Section */}
                            <div style={{ marginTop: "30px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3>My Joined Events</h3>
                                    <button
                                        onClick={fetchJoinedEvents}
                                        style={{
                                            padding: "6px 12px",
                                            backgroundColor: "#4CAF50",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Refresh Events
                                    </button>
                                </div>
                                {eventsLoading ? (
                                    <p>Loading your events...</p>
                                ) : eventsError ? (
                                    <p style={{ color: "red" }}>{eventsError}</p>
                                ) : joinedEvents.length === 0 ? (
                                    <p>You haven't joined any events yet.</p>
                                ) : (
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                                            <thead>
                                                <tr style={{ backgroundColor: "#f2f2f2" }}>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Title</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Sport</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Date & Time</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Location</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Participants</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {joinedEvents.map(event => {
                                                    // Format the date
                                                    const eventDate = new Date(event.event_datetime);
                                                    const formattedDate = eventDate.toLocaleDateString();
                                                    const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                    return (
                                                        <tr key={event.id} style={{ borderBottom: "1px solid #ddd" }}>
                                                            <td style={{ padding: "12px" }}>{event.title}</td>
                                                            <td style={{ padding: "12px" }}>{event.sport}</td>
                                                            <td style={{ padding: "12px" }}>{formattedDate} at {formattedTime}</td>
                                                            <td style={{ padding: "12px" }}>{event.location_name}</td>
                                                            <td style={{ padding: "12px" }}>{event.registered_count} / {event.max_players}</td>
                                                            <td style={{ padding: "12px" }}>
                                                                <div style={{ display: "flex", gap: "8px" }}>
                                                                    <button
                                                                        onClick={() => handleViewEvent(event.id)}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: "#2196F3",
                                                                            color: "white",
                                                                            border: "none",
                                                                            borderRadius: "4px",
                                                                            cursor: "pointer",
                                                                            fontSize: "13px"
                                                                        }}
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleLeaveEvent(event.id)}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: "#f44336",
                                                                            color: "white",
                                                                            border: "none",
                                                                            borderRadius: "4px",
                                                                            cursor: "pointer",
                                                                            fontSize: "13px"
                                                                        }}
                                                                    >
                                                                        Leave
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* My Created Events Section */}
                            <div style={{ marginTop: "50px", marginBottom: "30px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3>My Created Events</h3>
                                    <button
                                        onClick={fetchCreatedEvents}
                                        style={{
                                            padding: "6px 12px",
                                            backgroundColor: "#4CAF50",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Refresh Events
                                    </button>
                                </div>
                                {createdEventsLoading ? (
                                    <p>Loading your created events...</p>
                                ) : createdEventsError ? (
                                    <p style={{ color: "red" }}>{createdEventsError}</p>
                                ) : createdEvents.length === 0 ? (
                                    <p>You haven't created any events yet.</p>
                                ) : (
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                                            <thead>
                                                <tr style={{ backgroundColor: "#f2f2f2" }}>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Title</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Sport</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Date & Time</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Location</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Participants</th>
                                                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {createdEvents.map(event => {
                                                    // Format the date
                                                    const eventDate = new Date(event.event_datetime);
                                                    const formattedDate = eventDate.toLocaleDateString();
                                                    const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                    return (
                                                        <tr key={event.id} style={{ borderBottom: "1px solid #ddd" }}>
                                                            <td style={{ padding: "12px" }}>{event.title}</td>
                                                            <td style={{ padding: "12px" }}>{event.sport}</td>
                                                            <td style={{ padding: "12px" }}>{formattedDate} at {formattedTime}</td>
                                                            <td style={{ padding: "12px" }}>{event.location_name}</td>
                                                            <td style={{ padding: "12px" }}>{event.registered_count || 0} / {event.max_players}</td>
                                                            <td style={{ padding: "12px" }}>
                                                                <div style={{ display: "flex", gap: "8px" }}>
                                                                    <button
                                                                        onClick={() => handleViewEvent(event.id)}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: "#2196F3",
                                                                            color: "white",
                                                                            border: "none",
                                                                            borderRadius: "4px",
                                                                            cursor: "pointer",
                                                                            fontSize: "13px"
                                                                        }}
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateEvent(event.id)}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: "#FF9800",
                                                                            color: "white",
                                                                            border: "none",
                                                                            borderRadius: "4px",
                                                                            cursor: "pointer",
                                                                            fontSize: "13px"
                                                                        }}
                                                                    >
                                                                        Update
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteEvent(event.id)}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: "#f44336",
                                                                            color: "white",
                                                                            border: "none",
                                                                            borderRadius: "4px",
                                                                            cursor: "pointer",
                                                                            fontSize: "13px"
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: "30px", textAlign: "center" }}>
                                <button
                                    onClick={() => handleNavigate("/Profile")}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <p>No profile found. Please create a profile.</p>
                            <button
                                onClick={() => handleNavigate("/Profile")}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginTop: "20px"
                                }}
                            >
                                Create Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
