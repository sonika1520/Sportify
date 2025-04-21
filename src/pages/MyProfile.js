import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getUserJoinedEvents, getUserCreatedEvents, leaveEvent, deleteEvent } from "../api";
import "./MyProfile.css";

export default function MyProfile() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [createdEvents, setCreatedEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('joined');
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    useEffect(() => {
        const checkProfileOnce = async () => {
            if (sessionStorage.getItem('profileCheckDone') === 'true') {
                setInitialCheckDone(true);
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/v1/profile/0', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.status === 404) {
                    navigate('/profile');
                    return;
                }

                sessionStorage.setItem('profileCheckDone', 'true');
            } catch (error) {
                console.error('Error checking profile:', error);
            }

            setInitialCheckDone(true);
        };

        checkProfileOnce();
    }, [navigate]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const result = await getUserProfile();
            if (!result.error) {
                const profile = result.data || result;
                setProfileData(profile);
                setError('');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to load profile data: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        setEventsLoading(true);
        try {
            const [joinedResult, createdResult] = await Promise.all([
                getUserJoinedEvents(),
                getUserCreatedEvents()
            ]);
            
            setJoinedEvents(joinedResult.data || []);
            setCreatedEvents(createdResult.data || []);
        } catch (err) {
            setError('Failed to load events: ' + (err.message || 'Unknown error'));
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        if (!initialCheckDone) return;
        fetchProfile();
        fetchEvents();
    }, [initialCheckDone]);

    const handleLeaveEvent = async (eventId) => {
        try {
            await leaveEvent(eventId);
            await fetchEvents();
            alert('Successfully left the event!');
        } catch (err) {
            alert('Failed to leave event: ' + (err.message || 'Unknown error'));
        }
    };

    // Handle navigation
    const handleNavigate = (path) => {
        console.log('MyProfile: Navigating to:', path);
        navigate(path);
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteEvent(eventId);
            await fetchEvents();
            alert('Successfully deleted the event!');
        } catch (err) {
            alert('Failed to delete event: ' + (err.message || 'Unknown error'));
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (!initialCheckDone || loading) {
        return (
            <div className="profile-container">
                <div className="loading-overlay">
                    <h2>Loading...</h2>
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
                        fontWeight: 600,
                        fontStyle: 'italic'
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

        <div className="profile-container">
            <div className="profile-card">
            <div className="profile-header">
  <div className="profile-main">
    <div className="profile-avatar">
      {profileData?.first_name?.[0]?.toUpperCase() || '?'}
    </div>
    <div className="profile-info">
      <h2 className="profile-name">{profileData?.first_name} {profileData?.last_name}</h2>
      <div className="profile-details">
        <div className="profile-detail">
          <span>Age</span>
          <span>{profileData?.age}</span>
        </div>
        <div className="profile-detail">
          <span>Gender</span>
          <span>{profileData?.gender}</span>
        </div>
        <div className="profile-detail">
          <span>Email</span>
          <span>{profileData?.email}</span>
        </div>
        <div className="profile-detail">
          <span>Sports Preferences</span>
          <div className="sports-tags">
            {profileData?.sport_preference?.map((sport, index) => (
              <span key={index} className="sport-tag">{sport}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


                <div className="tabs-container">
                    <div className="tabs-header">
                        <button 
                            className={`tab ${activeTab === 'joined' ? 'active' : ''}`}
                            onClick={() => setActiveTab('joined')}
                        >
                            Joined Events ({joinedEvents.length})
                        </button>
                        <button 
                            className={`tab ${activeTab === 'created' ? 'active' : ''}`}
                            onClick={() => setActiveTab('created')}
                        >
                            Created Events ({createdEvents.length})
                        </button>
                    </div>

                    <button className="refresh-button" onClick={fetchEvents}>
                        Refresh Events
                    </button>

                    {eventsLoading ? (
                        <div className="loading-message">Loading events...</div>
                    ) : (
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Sport</th>
                                    <th>Date & Time</th>
                                    <th>Location</th>
                                    <th>Participants</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'joined' ? (
                                    joinedEvents.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="no-events">You haven't joined any events yet.</td>
                                        </tr>
                                    ) : (
                                        joinedEvents.map(event => (
                                            <tr key={event.id}>
                                                <td>{event.title}</td>
                                                <td>{event.sport}</td>
                                                <td>{formatDate(event.event_datetime)}</td>
                                                <td>{event.location_name}</td>
                                                <td>{event.registered_count || 0}/{event.max_players}</td>
                                                <td className="action-buttons">
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => navigate(`/events/${event.id}`)}
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        className="leave-button"
                                                        onClick={() => handleLeaveEvent(event.id)}
                                                    >
                                                        Leave
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                ) : (
                                    createdEvents.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="no-events">You haven't created any events yet.</td>
                                        </tr>
                                    ) : (
                                        createdEvents.map(event => (
                                            <tr key={event.id}>
                                                <td>{event.title}</td>
                                                <td>{event.sport}</td>
                                                <td>{formatDate(event.event_datetime)}</td>
                                                <td>{event.location_name}</td>
                                                <td>{event.registered_count || 0}/{event.max_players}</td>
                                                <td className="action-buttons">
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => navigate(`/events/${event.id}`)}
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        className="update-button"
                                                        onClick={() => navigate(`/update-event/${event.id}`)}
                                                    >
                                                        Update
                                                    </button>
                                                    <button 
                                                        className="delete-button"
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
}
