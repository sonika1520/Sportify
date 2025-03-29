import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
// BACKEND-INTEGRATION: Uncomment the following line when connecting to backend
// import axios from 'axios';

/**
 * CreateEvent Component
 * Renders a form for creating new sports events.
 * Handles form submission, location search, and validation.
 */
export default function CreateEvent() {
    const navigate = useNavigate();
    
    // Initialize form data state with empty values
    const [formData, setFormData] = useState({
        sport: "",
        event_date: "",
        max_players: "",
        location_name: "",
        latitude: "",
        longitude: "",
        description: "",
        title: ""
    });

    // States for managing UI interactions and feedback
    const [locationSuggestions, setLocationSuggestions] = useState([]); // Stores location search results
    const [showSuggestions, setShowSuggestions] = useState(false);     // Controls location dropdown visibility
    const [error, setError] = useState("");                           // Stores error messages
    const [loading, setLoading] = useState(false);                    // Tracks form submission status

    /**
     * Handles changes in form input fields
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "max_players" ? Number(value) : value
        });

        // Trigger location search when location input changes
        if (name === 'location_name') {
            handleLocationSearch(value);
        }
    };

    /**
     * Handles location search functionality
     * Currently using mock data - will be replaced with API call
     * @param {string} searchText - The location search query
     */
    const handleLocationSearch = async (searchText) => {
        if (searchText.length < 3) {
            setLocationSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // BACKEND-INTEGRATION: Remove this mock data when connecting to backend
        const mockLocations = [
            { name: "Central Park", latitude: "40.7829", longitude: "-73.9654" },
            { name: "Central Stadium", latitude: "40.7580", longitude: "-73.9855" }
        ];
        setLocationSuggestions(mockLocations);
        setShowSuggestions(true);

        // BACKEND-INTEGRATION: Uncomment this block when connecting to backend
        /*
        try {
            const response = await axios.get(`your-location-api-endpoint?search=${searchText}`);
            setLocationSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching locations:', error);
            setLocationSuggestions([]);
        }
        */
    };

    /**
     * Handles selection of a location from the suggestions dropdown
     * @param {Object} suggestion - The selected location object
     */
    const handleLocationSelect = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            location_name: suggestion.name,
            latitude: suggestion.latitude,
            longitude: suggestion.longitude
        }));
        setShowSuggestions(false);
    };

    // Close location suggestions dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowSuggestions(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    /**
     * Handles form submission
     * Currently using localStorage for demonstration
     * Will be replaced with API call to backend
     * @param {Event} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // BACKEND-INTEGRATION: Remove this temporary implementation
            {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Store event in localStorage for demonstration
                const existingEvents = JSON.parse(localStorage.getItem('events') || '[]');
                const newEvent = {
                    ...formData,
                    id: Date.now(),
                    creator: "Current User",
                    created_at: new Date().toISOString()
                };
                localStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));

                alert("Event created successfully!");
                navigate("/home");
            }

            // BACKEND-INTEGRATION: Uncomment this block when connecting to backend
            /*
            const response = await axios.post('http://localhost:8080/v1/events', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
                }
            });

            if (response.status === 201) {
                alert("Event created successfully!");
                navigate("/home");
            }
            */
        } catch (error) {
            setError("Failed to create event. Please try again.");
            // BACKEND-INTEGRATION: Update error handling
            // setError(error.response?.data?.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    // Component UI rendering
    return (
        // Main container with full viewport height and background
        <div style={{ 
            minHeight: "100vh", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
        }}>
            {/* Form container box */}
            <div style={{ 
                backgroundColor: "white", 
                borderRadius: "10px", 
                padding: "50px",
                width: "500px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
            }}>
                {/* Form title */}
                <h2 style={{ 
                    textAlign: "center", 
                    marginBottom: "30px",
                    fontSize: "24px",
                    color: "#333"
                }}>Create Event</h2>
                
                {/* Error message display */}
                {error && <p style={{ color: "red", fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>{error}</p>}
                
                {/* Event creation form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {/* Form fields - each wrapped in a div for proper spacing */}
                    {/* Event Title field */}
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Event Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter event title"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        />
                    </div>

                    {/* Description field */}
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Enter event description"
                            rows="4"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd",
                                resize: "vertical"
                            }}
                        />
                    </div>

                    {/* Sport selection dropdown */}
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Sport</label>
                        <select
                            name="sport"
                            value={formData.sport}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        >
                            <option value="">Select a sport</option>
                            <option value="Football">Football</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Tennis">Tennis</option>
                            <option value="Cricket">Cricket</option>
                            <option value="Soccer">Soccer</option>
                            <option value="Baseball">Baseball</option>
                        </select>
                    </div>

                    {/* Maximum Players field */}
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Maximum Players</label>
                        <input
                            type="number"
                            name="max_players"
                            value={formData.max_players}
                            onChange={handleChange}
                            required
                            placeholder="Enter max players"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        />
                    </div>

                    {/* Location field with suggestions dropdown */}
                    <div style={{ position: "relative" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Location</label>
                        <input
                            type="text"
                            name="location_name"
                            value={formData.location_name}
                            onChange={handleChange}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (formData.location_name.length >= 3) {
                                    setShowSuggestions(true);
                                }
                            }}
                            required
                            placeholder="Search for a location"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        />
                        {/* Location suggestions dropdown */}
                        {showSuggestions && locationSuggestions.length > 0 && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                backgroundColor: "white",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                zIndex: 1000,
                                maxHeight: "200px",
                                overflowY: "auto"
                            }}>
                                {locationSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleLocationSelect(suggestion)}
                                        style={{
                                            padding: "8px",
                                            cursor: "pointer",
                                            hover: {
                                                backgroundColor: "#f5f5f5"
                                            }
                                        }}
                                    >
                                        <span>{suggestion.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date and Time field */}
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Date and Time</label>
                        <input
                            type="datetime-local"
                            name="event_date"
                            value={formData.event_date}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        />
                    </div>

                    {/* Submit button */}
                    <button 
                        type="submit" 
                        style={{
                            backgroundColor: loading ? "#ccc" : "black",
                            color: "white",
                            padding: "12px",
                            borderRadius: "5px",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: "20px",
                            fontSize: "16px",
                            fontWeight: "500"
                        }}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Event"}
                    </button>
                </form>
            </div>
        </div>
    );
}