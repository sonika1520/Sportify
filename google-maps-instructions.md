# Adding Google Maps to Your Application

## Option 1: Add the Google Maps API Script to index.html

The most reliable way to add Google Maps to your application is to add the script tag directly to your `public/index.html` file:

1. Open the file `public/index.html`
2. Add the following script tag just before the closing `</head>` tag:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY" async defer></script>
```

3. Replace `YOUR_API_KEY` with your actual Google Maps API key
4. Save the file and restart your development server

## Option 2: Use Environment Variables

If you prefer to keep your API key in environment variables:

1. Create a `.env` file in the root of your project
2. Add the following line:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

3. Replace `your_actual_api_key_here` with your actual Google Maps API key
4. Save the file and restart your development server

## Troubleshooting

If you're still seeing the "Something went wrong" error:

1. Check the browser console for specific error messages
2. Common errors include:
   - "Google Maps JavaScript API error: InvalidKeyMapError" - Your API key is invalid or restricted
   - "Google Maps JavaScript API error: MissingKeyMapError" - No API key was provided
   - "Google Maps JavaScript API error: RefererNotAllowedMapError" - Your domain isn't allowed in the API key restrictions

3. Make sure you've enabled the "Maps JavaScript API" in the Google Cloud Console
4. Check that billing is set up for your Google Cloud project
5. If you've set restrictions on your API key, make sure your development domain (e.g., localhost:3000) is included

## Alternative: Use OpenStreetMap

If you continue to have issues with Google Maps, you can use OpenStreetMap as a free alternative:

1. Open `src/pages/EventDetails.js`
2. Replace the GoogleMap component with an OpenStreetMap iframe:

```jsx
<iframe 
  title="Event Location"
  width="100%"
  height="100%"
  frameBorder="0"
  scrolling="no"
  marginHeight="0"
  marginWidth="0"
  src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.longitude-0.01},${event.latitude-0.01},${event.longitude+0.01},${event.latitude+0.01}&layer=mapnik&marker=${event.latitude},${event.longitude}`}
  style={{ border: 0 }}
></iframe>
```

This will provide a free, reliable map without requiring an API key.
