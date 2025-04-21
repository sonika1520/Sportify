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
      // Combine date and time into a single ISO string
      const eventDateTime = new Date(
        `${formData.event_date}T${formData.event_time}`
      ).toISOString()

      // Log the data we're sending
      console.log('Sending update with date:', eventDateTime);

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
    <div className="create-event-container">
      <div className="create-event-form-container">
        <h1>Update Event</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sport">Sport</label>
            <input
              type="text"
              id="sport"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              required
              placeholder="Enter sport type"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_date">Date</label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event_time">Time</label>
              <input
                type="time"
                id="event_time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="max_players">Maximum Players</label>
            <input
              type="number"
              id="max_players"
              name="max_players"
              value={formData.max_players}
              onChange={handleChange}
              required
              min="2"
              max="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location_name">Location</label>
            <input
              type="text"
              id="location_name"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              required
              placeholder="Search for a location"
              ref={inputRef}
            />
            {formData.latitude && formData.longitude && (
              <div className="location-preview">
                <small>
                  Selected: {formData.location_name} ({formData.latitude.toFixed(6)},{' '}
                  {formData.longitude.toFixed(6)})
                </small>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your event"
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/events/${eventId}`)}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
