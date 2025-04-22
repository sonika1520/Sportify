import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getEventDetails, updateEvent } from '../api'
import './CreateEvent.css'

export default function UpdateEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    sport: '',
    event_date: '',
    event_time: '',
    max_players: 10,
    location_name: '',
    latitude: null,
    longitude: null,
    description: '',
  })

  // Refs for Google Maps Places Autocomplete
  const autocompleteRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch event details when component mounts
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setInitialLoading(true)
        const result = await getEventDetails(eventId)

        if (result.error) {
          setError(result.error)
          return
        }

        const eventData = result.data || result

        // Convert ISO date to local date and time strings
        const eventDate = new Date(eventData.event_datetime)
        const dateString = eventDate.toISOString().split('T')[0]
        const timeString = eventDate.toTimeString().slice(0, 5)

        setFormData({
          title: eventData.title || '',
          sport: eventData.sport || '',
          event_date: dateString,
          event_time: timeString,
          max_players: eventData.max_players || 10,
          location_name: eventData.location_name || '',
          latitude: eventData.latitude || null,
          longitude: eventData.longitude || null,
          description: eventData.description || '',
        })
      } catch (err) {
        setError('Failed to load event details: ' + (err.message || 'Unknown error'))
        console.error('Error fetching event details:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId])

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps Places API not loaded')
      return
    }

    if (inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ['establishment', 'geocode'] }
      )

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()

        if (!place.geometry || !place.geometry.location) {
          console.error('No location data for this place')
          return
        }

        setFormData((prev) => ({
          ...prev,
          location_name: place.name || place.formatted_address || 'Selected Location',
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        }))
      })
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [initialLoading]) // Re-run after initial data is loaded

  /**
   * Handles form input changes
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Handles form submission
   * Updates the event with the new data
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate event ID
    if (!eventId) {
      setError('Event ID is missing')
      return
    }

    console.log('Updating event with ID:', eventId)

    // Validate location data
    if (!formData.latitude || !formData.longitude) {
      setError('Please select a location from the dropdown suggestions')
      return
    }

    setLoading(true)

    try {
      // Get the ISO string directly from the form data
      const eventDateTime = new Date(
        `${formData.event_date}T${formData.event_time}`
      ).toISOString()

      // Log the data we're sending
      console.log('Sending update with date:', eventDateTime)

      // Update event using the API
      // The backend expects event_date, not event_datetime
      const updatedEvent = await updateEvent(eventId, {
        title: formData.title,
        sport: formData.sport,
        event_date: eventDateTime,
        max_players: parseInt(formData.max_players),
        location_name: formData.location_name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description: formData.description,
      })

      console.log('Event updated successfully:', updatedEvent)
      alert('Event updated successfully!')
      navigate(`/events/${eventId}`)
    } catch (err) {
      setError(err.message || 'Failed to update event')
      console.error('Error updating event:', err)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="loading-message">Loading event details...</div>
      </div>
    )
  }

  return (
    <div>
      <nav className="navbar">
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
          <div style={{ height: '100%', width: '100%', flex: 3 }}>
            <button className="button" onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}>Sign Out</button>
          </div>
        </div>
      </nav>

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '50px',
            width: '500px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '30px',
              fontSize: '24px',
              color: '#333',
            }}
          >
            Update Event
          </h2>

          {error && (
            <p
              style={{
                color: 'red',
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <div style={{ marginBottom: '15px' }}>
              <label
                htmlFor="title"
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555',
                }}
              >
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter event title"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label
                htmlFor="description"
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555',
                }}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your event"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '100px',
                }}
              ></textarea>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label
                htmlFor="sport"
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555',
                }}
              >
                Sport
              </label>
              <select
                id="sport"
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
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



            <div style={{ marginBottom: '15px' }}>
              <label
                htmlFor="max_players"
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555',
                }}
              >
                Maximum Players
              </label>
              <input
                type="number"
                id="max_players"
                name="max_players"
                value={formData.max_players}
                onChange={handleChange}
                required
                min="2"
                max="100"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label
                htmlFor="location_name"
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555',
                }}
              >
                Location
              </label>
              <input
                type="text"
                id="location_name"
                name="location_name"
                value={formData.location_name}
                onChange={handleChange}
                required
                placeholder="Search for a location"
                ref={inputRef}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              />
              {formData.latitude && formData.longitude && (
                <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                  <small>
                    Selected: {formData.location_name} ({formData.latitude.toFixed(6)},{' '}
                    {formData.longitude.toFixed(6)})
                  </small>
                </div>
              )}
            </div>

            {/* Date and Time field */}
            <div style={{ marginBottom: '15px' }}>
              <label
                htmlFor='event_date'
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555',
                }}
              >
                Date and Time
              </label>
              <input
                id='event_date'
                type='datetime-local'
                name='event_date'
                value={`${formData.event_date}T${formData.event_time}`}
                onChange={(e) => {
                  const dateTime = new Date(e.target.value);
                  const dateString = dateTime.toISOString().split('T')[0];
                  const timeString = e.target.value.split('T')[1];
                  setFormData({
                    ...formData,
                    event_date: dateString,
                    event_time: timeString
                  });
                }}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}`)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
