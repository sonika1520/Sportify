import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Main.css"
import { getEvents, joinEvent } from '../api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faUsers, faRunning } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

export default function Home() {
    console.log('Home component: Mounting');
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Check if user has a profile only once when component mounts
    useEffect(() => {
        const checkProfileOnce = async () => {
            console.log('Home component: Performing one-time profile check');

            // Skip check if we've already done it in this session
            if (sessionStorage.getItem('profileCheckDone') === 'true') {
                console.log('Home component: Profile check already done in this session');
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
                    console.log('Home component: User has no profile, redirecting to profile creation');
                    navigate('/profile');
                    return;
                }

                // If we get here, user has a profile or there was a different error
                // Either way, we'll allow them to stay on the home page
                console.log('Home component: User has a profile or there was a non-404 error');
                sessionStorage.setItem('profileCheckDone', 'true');
            } catch (error) {
                console.error('Home component: Error checking profile:', error);
                // On error, we'll still let them stay on the home page
            }

            setInitialCheckDone(true);
        };

        checkProfileOnce();
    }, [navigate]);

    // Function to handle search input changes
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (!value.trim()) {
            // If search is empty, show all events
            setFilteredEvents(events);
            return;
        }

        // Filter events based on title or description containing the search term
        const filtered = events.filter(event => {
            const titleMatch = event.title?.toLowerCase().includes(value.toLowerCase());
            const descriptionMatch = event.description?.toLowerCase().includes(value.toLowerCase());
            return titleMatch || descriptionMatch;
        });

        setFilteredEvents(filtered);
    };

    // Function to clear search
    const clearSearch = () => {
        setSearchTerm('');
        setFilteredEvents(events);
    };

    useEffect(() => {
        // Only fetch events after the initial profile check is done
        if (!initialCheckDone) {
            console.log('Home component: Waiting for profile check before fetching events');
            return;
        }

        console.log('Home component: Profile check done, now fetching events');
        const fetchEvents = async () => {
            try {
                console.log('Home component: Fetching events...');
                const eventsResponse = await getEvents();
                const eventsData = eventsResponse.data;
                console.log("Home component: Events received: ", eventsData);
                setEvents(eventsData);
                setFilteredEvents(eventsData); // Initialize filtered events with all events
            } catch (error) {
                console.error('Home component: Error fetching events:', error);
                setError('Failed to load events');
                setLoading(false);
            }
        };

        fetchEvents();

        // Cleanup function to log when component unmounts
        return () => {
            console.log('Home component: Unmounting');
        };
    }, [initialCheckDone]);

    // Update filtered events when events change
    useEffect(() => {
        if (searchTerm.trim()) {
            // If there's a search term, apply the filter
            const filtered = events.filter(event => {
                const titleMatch = event.title?.toLowerCase().includes(searchTerm.toLowerCase());
                const descriptionMatch = event.description?.toLowerCase().includes(searchTerm.toLowerCase());
                return titleMatch || descriptionMatch;
            });
            setFilteredEvents(filtered);
        } else {
            // Otherwise, show all events
            setFilteredEvents(events);
        }
    }, [events, searchTerm]); // Re-run when initialCheckDone changes

    const handleJoinTeam = async (eventId) => {
        try {
            setLoading(true);
            const response = await joinEvent(eventId);

            if (response.error) {
                setError(response.error);
                alert(response.error);
            } else {
                // Add the event ID to the joined events list
                setJoinedEvents([...joinedEvents, eventId]);
                alert('Successfully joined the event!');

                // Refresh events to get updated data
                const eventsResponse = await getEvents();
                if (eventsResponse.data) {
                    // Update the events with the new data
                    const updatedEvents = eventsResponse.data.map(event => {
                        if (event.id === eventId) {
                            // Add current user to participants if not already there
                            const currentUserId = parseInt(localStorage.getItem('userId'));
                            if (!event.participants.some(p => p.user_id === currentUserId)) {
                                event.participants.push({
                                    user_id: currentUserId
                                });
                                event.registered_count = (event.registered_count || 0) + 1;
                            }
                        }
                        return event;
                    });
                    setEvents(updatedEvents);
                }
            }
        } catch (error) {
            console.error('Error joining event:', error);
            setError('Failed to join event. ' + (error.message || ''));
            alert('Failed to join event: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (eventId) => {
        // TODO: Implement view event functionality
        console.log('Viewing event:', eventId);
        navigate(`/events/${eventId}`);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSportEmoji = (sport) => {
        const sportEmojis = {
            'Football': '⚽',
            'Basketball': '🏀',
            'Tennis': '🎾',
            'Volleyball': '🏐',
            'Baseball': '⚾',
            'Badminton': '🏸',
            'Table Tennis': '🏓',
            'Cricket': '🏏',
            'Rugby': '🏉',
            'Hockey': '🏑'
        };
        return sportEmojis[sport] || '⚽';
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

    // if (loading) {
    //     return <div className="loading">Loading events...</div>;
    // }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}>
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
                    <div style={{ flex: 3, height: '100%', width: '100%' }}><button className="button" onClick={() => navigate("/Home")}>Home</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => navigate("/MyProfile")}>Profile</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}>
                        <button
                            className="button"
                            onClick={() => navigate("/create-event")}
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                padding: '0 20px'
                            }}
                        >
                            +
                        </button>
                    </div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" id="but3" onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}>Sign Out</button></div>
                </div>
            </nav>
    
            {/* Search Bar */}
            <div style={{
                padding: "20px 20px 0 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%"
            }}>
                <div style={{
                    display: "flex",
                    maxWidth: "600px",
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "30px",
                    overflow: "hidden",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
                }}>
                    <input
                        type="text"
                        placeholder="Search events by name or description..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            flex: 1,
                            padding: "12px 20px",
                            border: "none",
                            fontSize: "16px",
                            outline: "none"
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            style={{
                                background: "none",
                                border: "none",
                                padding: "0 15px",
                                cursor: "pointer",
                                fontSize: "18px",
                                color: "#888"
                            }}
                        >
                            ✕
                        </button>
                    )}
                    <button
                        style={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            padding: "0 20px",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Search
                    </button>
                </div>
            </div>
    
            {/* Search Results Count */}
            <div style={{
                padding: "10px 20px",
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)"
            }}>
                {searchTerm ? (
                    <p>
                        Found {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} for "{searchTerm}"
                    </p>
                ) : null}
            </div>
    
            <div className="event-grid">
                {/* No Events Found Message */}
                {filteredEvents.length === 0 ? (
                    <div style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "40px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        borderRadius: "8px",
                        margin: "20px auto"
                    }}>
                        <h3>No events found matching your search.</h3>
                        <p>Try a different search term or clear the search to see all events.</p>
                        <button
                            onClick={clearSearch}
                            style={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginTop: "10px"
                            }}
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    filteredEvents.map(event => (
                        <div key={event.id} className="event-card">
                            <div className="event-card-header">
                                <div className="event-creator">
                                    <div className="creator-avatar-home">
                                        {event.owner_first_name ? event.owner_first_name[0] : '?'}
                                    </div>
                                    <span className="creator-name-home">
                                        {event.owner_first_name} {event.owner_last_name}
                                    </span>
                                </div>
                                <div className="participant-count">
                                    {event.registered_count}/{event.max_players}
                                </div>
                            </div>
                            <div className="event-content">
                                <h3 className="event-title">{event.title}</h3>
                                <div className="event-info">
                                    <div className="info-row">
                                        <span className="info-icon">{getSportEmoji(event.sport)}</span>
                                        <span>{event.sport}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-icon">📍</span>
                                        <span>{event.location_name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-icon">📅</span>
                                        <span>{formatDate(event.event_datetime)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="event-actions">
                                <button
                                    onClick={() => handleViewDetails(event.id)}
                                    className="action-button view-button"
                                >
                                    View Details
                                </button>
                                {event.participants && (
                                    <button
                                        onClick={() => handleJoinTeam(event.id)}
                                        className="action-button join-button"
                                        disabled={
                                            event.participants.some(p => 
                                                p.user_id === parseInt(localStorage.getItem('userId'))
                                            ) || 
                                            event.participants.length >= event.max_players
                                        }
                                    >
                                        {event.participants.some(p => 
                                            p.user_id === parseInt(localStorage.getItem('userId'))
                                        )
                                            ? "Already Joined"
                                            : event.participants.length >= event.max_players
                                                ? "Full"
                                                : "Join Team"
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
    
}