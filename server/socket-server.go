package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	DefaultPort  = "4000"
	MaxClients   = 10000
	MaxMsgSize   = 1024 * 1024 // 1MB
	PingInterval = 30 * time.Second
	PongWait     = 60 * time.Second
	WriteWait    = 10 * time.Second
)

type Client struct {
	Conn *websocket.Conn
	Send chan []byte
	ID   string
}

type Message struct {
	Event     string          `json:"event"`
	Room      string          `json:"room,omitempty"`
	Data      json.RawMessage `json:"data,omitempty"`
	Timestamp int64           `json:"timestamp,omitempty"`
}

type Request struct {
	ID        string          `json:"id"`
	Data      json.RawMessage `json:"data"`
	Status    string          `json:"status"`
	CreatedAt int64           `json:"created_at"`
	UpdatedAt int64           `json:"updated_at"`
}

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			// In production, specify allowed origins
			allowedOrigins := map[string]bool{
				"http://localhost:3000": true,
				"https://dastak.pk":     true,
				// Add your production domains
			}
			return allowedOrigins[r.Header.Get("Origin")]
		},
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	server = &Server{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		rooms:      make(map[string]map[*Client]bool),
		requests:   make(map[string]Request),
	}
)

type Server struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	rooms      map[string]map[*Client]bool
	requests   map[string]Request
	mu         sync.RWMutex
}

func (s *Server) run() {
	for {
		select {
		case client := <-s.register:
			s.mu.Lock()
			s.clients[client] = true
			s.mu.Unlock()
			log.Printf("✅ Client connected. Total: %d", len(s.clients))

		case client := <-s.unregister:
			s.mu.Lock()
			if _, ok := s.clients[client]; ok {
				delete(s.clients, client)
				close(client.Send)
				// Remove from all rooms
				for room := range s.rooms {
					delete(s.rooms[room], client)
				}
			}
			s.mu.Unlock()
			log.Printf("❌ Client disconnected. Total: %d", len(s.clients))

		case message := <-s.broadcast:
			s.mu.RLock()
			for client := range s.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(s.clients, client)
				}
			}
			s.mu.RUnlock()
		}
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Rate limiting check
	if len(server.clients) >= MaxClients {
		http.Error(w, "Server at maximum capacity", http.StatusServiceUnavailable)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrade error: %v", err)
		return
	}

	client := &Client{
		Conn: conn,
		Send: make(chan []byte, 256),
		ID:   generateClientID(r),
	}

	// Register client
	server.register <- client

	// Start goroutines
	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		server.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(MaxMsgSize)
	c.Conn.SetReadDeadline(time.Now().Add(PongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(PongWait))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Read error: %v", err)
			}
			break
		}

		processMessage(c, message)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(PingInterval)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(WriteWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(WriteWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func processMessage(c *Client, msg []byte) {
	var message Message
	if err := json.Unmarshal(msg, &message); err != nil {
		log.Printf("Invalid JSON: %v", err)
		return
	}

	message.Timestamp = time.Now().Unix()

	switch message.Event {
	case "create_request":
		handleCreateRequest(c, message)
	case "job_accepted":
		handleJobAccepted(c, message)
	case "join":
		handleJoinRoom(c, message.Room)
	case "leave":
		handleLeaveRoom(c, message.Room)
	case "message":
		handleChatMessage(c, message)
	case "ping":
		sendResponse(c, Message{Event: "pong", Timestamp: time.Now().Unix()})
	default:
		log.Printf("Unknown event: %s", message.Event)
	}
}

func handleCreateRequest(c *Client, msg Message) {
	var data map[string]interface{}
	if err := json.Unmarshal(msg.Data, &data); err != nil {
		log.Printf("Invalid request data: %v", err)
		return
	}

	requestID := getString(data, "id", "req_"+time.Now().Format("20060102150405"))
	
	request := Request{
		ID:        requestID,
		Data:      msg.Data,
		Status:    "pending",
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
	}

	server.mu.Lock()
	server.requests[requestID] = request
	server.mu.Unlock()

	// Broadcast to all clients
	broadcastMsg := Message{
		Event:     "request:created",
		Data:      msg.Data,
		Timestamp: time.Now().Unix(),
	}

	broadcast(broadcastMsg)

	// Send confirmation to sender
	sendResponse(c, Message{
		Event:     "request_created",
		Data:      json.RawMessage(`{"id":"` + requestID + `","status":"pending"}`),
		Timestamp: time.Now().Unix(),
	})

	log.Printf("✅ Request created: %s", requestID)
}

func handleJobAccepted(c *Client, msg Message) {
	var data struct {
		RequestID string `json:"request_id"`
		WorkerID  string `json:"worker_id"`
	}
	
	if err := json.Unmarshal(msg.Data, &data); err != nil {
		log.Printf("Invalid job acceptance: %v", err)
		return
	}

	server.mu.Lock()
	if req, exists := server.requests[data.RequestID]; exists {
		req.Status = "accepted"
		req.UpdatedAt = time.Now().Unix()
		server.requests[data.RequestID] = req
	}
	server.mu.Unlock()

	// Notify room
	roomMsg := Message{
		Event: "job_accepted",
		Room:  "request_" + data.RequestID,
		Data:  msg.Data,
		Timestamp: time.Now().Unix(),
	}

	broadcastToRoom(roomMsg.Room, roomMsg)
	log.Printf("✅ Job accepted: %s by %s", data.RequestID, data.WorkerID)
}

func handleJoinRoom(c *Client, room string) {
	if room == "" {
		return
	}

	server.mu.Lock()
	if server.rooms[room] == nil {
		server.rooms[room] = make(map[*Client]bool)
	}
	server.rooms[room][c] = true
	server.mu.Unlock()

	sendResponse(c, Message{
		Event:     "joined",
		Room:      room,
		Timestamp: time.Now().Unix(),
	})
}

func handleLeaveRoom(c *Client, room string) {
	server.mu.Lock()
	delete(server.rooms[room], c)
	if len(server.rooms[room]) == 0 {
		delete(server.rooms, room)
	}
	server.mu.Unlock()
}

func handleChatMessage(c *Client, msg Message) {
	if msg.Room == "" {
		return
	}

	// Broadcast to room
	broadcastToRoom(msg.Room, msg)
}

func broadcast(msg Message) {
	msgBytes, _ := json.Marshal(msg)
	server.broadcast <- msgBytes
}

func broadcastToRoom(room string, msg Message) {
	server.mu.RLock()
	clients := server.rooms[room]
	msgBytes, _ := json.Marshal(msg)
	
	for client := range clients {
		select {
		case client.Send <- msgBytes:
		default:
			close(client.Send)
			delete(server.clients, client)
		}
	}
	server.mu.RUnlock()
}

func sendResponse(c *Client, msg Message) {
	msgBytes, _ := json.Marshal(msg)
	c.Send <- msgBytes
}

func generateClientID(r *http.Request) string {
	return "client_" + time.Now().Format("20060102150405") + "_" + r.RemoteAddr
}

func getString(data map[string]interface{}, key, defaultValue string) string {
	if val, ok := data[key].(string); ok && val != "" {
		return val
	}
	return defaultValue
}

func startServer() {
	port := os.Getenv("PORT")
	if port == "" {
		port = DefaultPort
	}

	// Start server goroutine
	go server.run()

	http.HandleFunc("/ws", handleConnections)
	
	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "healthy",
			"clients":   len(server.clients),
			"requests":  len(server.requests),
			"timestamp": time.Now().Unix(),
		})
	})

	log.Printf("🚀 WebSocket Server starting on :%s", port)
	log.Printf("📊 Max Clients: %d | Max Message Size: %d bytes", MaxClients, MaxMsgSize)
	
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("Server failed: ", err)
	}
}

func main() {
	startServer()
}