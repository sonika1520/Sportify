package websocket

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
)

// TestNewHub tests the creation of a new Hub
func TestNewHub(t *testing.T) {
	hub := NewHub()
	assert.NotNil(t, hub)
	assert.NotNil(t, hub.clients)
	assert.NotNil(t, hub.broadcast)
	assert.NotNil(t, hub.register)
	assert.NotNil(t, hub.unregister)
	assert.NotNil(t, hub.messages)
}

// TestHubRun tests the Run method of the Hub
func TestHubRun(t *testing.T) {
	hub := NewHub()
	
	// Start the hub in a goroutine
	go hub.Run()
	
	// Give the hub time to start
	time.Sleep(10 * time.Millisecond)
	
	// Create a test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Upgrade the HTTP connection to a WebSocket connection
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade connection: %v", err)
		}
		
		// Create a test client with a valid connection
		client := &Client{
			conn:     conn,
			eventID:  1,
			userID:   1,
			username: "testuser",
		}
		
		// Register the client
		hub.register <- client
		
		// Give the hub time to process the registration
		time.Sleep(10 * time.Millisecond)
		
		// Check if the client was registered
		hub.mu.Lock()
		_, exists := hub.clients[client]
		hub.mu.Unlock()
		
		assert.True(t, exists, "Client should be registered")
		
		// Unregister the client
		hub.unregister <- client
		
		// Give the hub time to process the unregistration
		time.Sleep(10 * time.Millisecond)
		
		// Check if the client was unregistered
		hub.mu.Lock()
		_, exists = hub.clients[client]
		hub.mu.Unlock()
		
		assert.False(t, exists, "Client should be unregistered")
	}))
	defer server.Close()
	
	// Connect to the WebSocket server
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket server: %v", err)
	}
	defer conn.Close()
	
	// Give the test time to complete
	time.Sleep(100 * time.Millisecond)
}

// TestHandleWebSocket tests the HandleWebSocket method
func TestHandleWebSocket(t *testing.T) {
	hub := NewHub()
	
	// Start the hub in a goroutine
	go hub.Run()
	
	// Create a test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Upgrade the HTTP connection to a WebSocket connection
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade connection: %v", err)
		}
		
		// Handle the WebSocket connection
		hub.HandleWebSocket(conn, 1, 1, "testuser")
	}))
	defer server.Close()
	
	// Convert the server URL to a WebSocket URL
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")
	
	// Connect to the WebSocket server
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket server: %v", err)
	}
	defer conn.Close()
	
	// Give the hub time to process the connection
	time.Sleep(10 * time.Millisecond)
	
	// Check if the client was registered
	hub.mu.Lock()
	clientCount := len(hub.clients)
	hub.mu.Unlock()
	
	assert.Equal(t, 1, clientCount, "There should be one client registered")
	
	// Send a message
	message := Message{
		Content: "Hello, world!",
	}
	
	err = conn.WriteJSON(message)
	if err != nil {
		t.Fatalf("Failed to send message: %v", err)
	}
	
	// Give the hub time to process the message
	time.Sleep(10 * time.Millisecond)
	
	// Check if the message was stored
	hub.mu.Lock()
	messages, exists := hub.messages[1]
	hub.mu.Unlock()
	
	assert.True(t, exists, "Messages should exist for event ID 1")
	assert.Equal(t, 1, len(messages), "There should be one message")
	assert.Equal(t, "Hello, world!", messages[0].Content, "Message content should match")
	assert.Equal(t, int64(1), messages[0].EventID, "Event ID should match")
	assert.Equal(t, int64(1), messages[0].UserID, "User ID should match")
	assert.Equal(t, "testuser", messages[0].Username, "Username should match")
}

// TestMessageBroadcast tests the message broadcasting functionality
func TestMessageBroadcast(t *testing.T) {
	hub := NewHub()
	
	// Start the hub in a goroutine
	go hub.Run()
	
	// Create two test servers
	server1 := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade connection: %v", err)
		}
		hub.HandleWebSocket(conn, 1, 1, "user1")
	}))
	defer server1.Close()
	
	server2 := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade connection: %v", err)
		}
		hub.HandleWebSocket(conn, 1, 2, "user2")
	}))
	defer server2.Close()
	
	// Connect to the WebSocket servers
	wsURL1 := "ws" + strings.TrimPrefix(server1.URL, "http")
	wsURL2 := "ws" + strings.TrimPrefix(server2.URL, "http")
	
	conn1, _, err := websocket.DefaultDialer.Dial(wsURL1, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket server 1: %v", err)
	}
	defer conn1.Close()
	
	conn2, _, err := websocket.DefaultDialer.Dial(wsURL2, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket server 2: %v", err)
	}
	defer conn2.Close()
	
	// Give the hub time to process the connections
	time.Sleep(10 * time.Millisecond)
	
	// Send a message from client 1
	message := Message{
		Content: "Hello from user1!",
	}
	
	err = conn1.WriteJSON(message)
	if err != nil {
		t.Fatalf("Failed to send message: %v", err)
	}
	
	// Give the hub time to process the message
	time.Sleep(10 * time.Millisecond)
	
	// Check if client 2 received the message
	var receivedMessage Message
	err = conn2.ReadJSON(&receivedMessage)
	if err != nil {
		t.Fatalf("Failed to receive message: %v", err)
	}
	
	assert.Equal(t, "Hello from user1!", receivedMessage.Content, "Message content should match")
	assert.Equal(t, int64(1), receivedMessage.EventID, "Event ID should match")
	assert.Equal(t, int64(1), receivedMessage.UserID, "User ID should match")
	assert.Equal(t, "user1", receivedMessage.Username, "Username should match")
}

// TestMessageHistory tests that new clients receive message history
func TestMessageHistory(t *testing.T) {
	hub := NewHub()
	
	// Start the hub in a goroutine
	go hub.Run()
	
	// Create a test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade connection: %v", err)
		}
		hub.HandleWebSocket(conn, 1, 1, "testuser")
	}))
	defer server.Close()
	
	// Connect to the WebSocket server
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")
	
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket server: %v", err)
	}
	defer conn.Close()
	
	// Give the hub time to process the connection
	time.Sleep(10 * time.Millisecond)
	
	// Send a message
	message := Message{
		Content: "Hello, world!",
	}
	
	err = conn.WriteJSON(message)
	if err != nil {
		t.Fatalf("Failed to send message: %v", err)
	}
	
	// Give the hub time to process the message
	time.Sleep(10 * time.Millisecond)
	
	// Close the connection
	conn.Close()
	
	// Create a new connection to simulate a new client
	conn2, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket server: %v", err)
	}
	defer conn2.Close()
	
	// Give the hub time to process the connection and send message history
	time.Sleep(10 * time.Millisecond)
	
	// Check if the new client received the message history
	var receivedMessage Message
	err = conn2.ReadJSON(&receivedMessage)
	if err != nil {
		t.Fatalf("Failed to receive message history: %v", err)
	}
	
	assert.Equal(t, "Hello, world!", receivedMessage.Content, "Message content should match")
	assert.Equal(t, int64(1), receivedMessage.EventID, "Event ID should match")
	assert.Equal(t, int64(1), receivedMessage.UserID, "User ID should match")
	assert.Equal(t, "testuser", receivedMessage.Username, "Username should match")
}

// TestMessageJSON tests the JSON serialization of messages
func TestMessageJSON(t *testing.T) {
	message := Message{
		EventID:   1,
		UserID:    1,
		Username:  "testuser",
		Content:   "Hello, world!",
		Timestamp: time.Now().Format(time.RFC3339),
	}
	
	// Serialize the message to JSON
	jsonData, err := json.Marshal(message)
	if err != nil {
		t.Fatalf("Failed to marshal message: %v", err)
	}
	
	// Deserialize the JSON back to a message
	var deserializedMessage Message
	err = json.Unmarshal(jsonData, &deserializedMessage)
	if err != nil {
		t.Fatalf("Failed to unmarshal message: %v", err)
	}
	
	// Check if the deserialized message matches the original
	assert.Equal(t, message.EventID, deserializedMessage.EventID, "Event ID should match")
	assert.Equal(t, message.UserID, deserializedMessage.UserID, "User ID should match")
	assert.Equal(t, message.Username, deserializedMessage.Username, "Username should match")
	assert.Equal(t, message.Content, deserializedMessage.Content, "Content should match")
	assert.Equal(t, message.Timestamp, deserializedMessage.Timestamp, "Timestamp should match")
} 