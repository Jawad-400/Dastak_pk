// package main

// import (
// 	"encoding/json"
// 	"log"
// 	"net/http"
// 	"os"
// 	"sync"
// 	"time"

// 	"github.com/gorilla/websocket"
// )

// const (
// 	DefaultPort  = "4001"
// 	MaxClients   = 10000
// 	MaxMsgSize   = 1024 * 1024 // 1MB
// 	PingInterval = 30 * time.Second
// 	PongWait     = 60 * time.Second
// 	WriteWait    = 10 * time.Second
// )

// // ==================== TYPES ====================
// type Client struct {
// 	Conn     *websocket.Conn
// 	Send     chan []byte
// 	ID       string
// 	UserType string // "customer" or "provider"
// 	UserID   string
// 	Service  string // For providers: "plumbing", "electrical", etc.
// }

// type Message struct {
// 	Event     string          `json:"event"`
// 	Room      string          `json:"room,omitempty"`
// 	Data      json.RawMessage `json:"data,omitempty"`
// 	Timestamp int64           `json:"timestamp,omitempty"`
// }

// type ServiceRequest struct {
// 	ID          string          `json:"id"`
// 	Title       string          `json:"title"`
// 	Description string          `json:"description"`
// 	Location    string          `json:"location"`
// 	Budget      string          `json:"budget"`
// 	CustomerID  string          `json:"customer_id"`
// 	Customer    string          `json:"customer"`
// 	Status      string          `json:"status"` // "pending", "accepted", "completed"
// 	ServiceType string          `json:"service_type"`
// 	Schedule    string          `json:"schedule"`
// 	Contact     string          `json:"contact"`
// 	CreatedAt   int64           `json:"created_at"`
// 	UpdatedAt   int64           `json:"updated_at"`
// 	RawData     json.RawMessage `json:"raw_data,omitempty"`
// }

// type Provider struct {
// 	ID      string `json:"id"`
// 	Name    string `json:"name"`
// 	Service string `json:"service"`
// 	Online  bool   `json:"online"`
// }

// // ==================== GLOBAL VARIABLES ====================
// var (
// 	upgrader = websocket.Upgrader{
// 		CheckOrigin: func(r *http.Request) bool {
// 			// Allow all origins for development
// 			return true
// 		},
// 		ReadBufferSize:  1024,
// 		WriteBufferSize: 1024,
// 	}

// 	server = &Server{
// 		clients:     make(map[*Client]bool),
// 		broadcast:   make(chan []byte, 256),
// 		register:    make(chan *Client),
// 		unregister:  make(chan *Client),
// 		rooms:       make(map[string]map[*Client]bool),
// 		requests:    make(map[string]ServiceRequest),
// 		providers:   make(map[string]*Client),
// 		customers:   make(map[string]*Client),
// 		allRequests: make([]ServiceRequest, 0),
// 	}
// )

// type Server struct {
// 	clients     map[*Client]bool
// 	broadcast   chan []byte
// 	register    chan *Client
// 	unregister  chan *Client
// 	rooms       map[string]map[*Client]bool
// 	requests    map[string]ServiceRequest
// 	providers   map[string]*Client
// 	customers   map[string]*Client
// 	allRequests []ServiceRequest
// 	mu          sync.RWMutex
// }

// // ==================== SERVER MAIN LOOP ====================
// func (s *Server) run() {
// 	log.Println("🚀 WebSocket server started. Waiting for connections...")
	
// 	for {
// 		select {
// 		case client := <-s.register:
// 			s.mu.Lock()
// 			s.clients[client] = true
			
// 			// Add to appropriate user map
// 			if client.UserType == "provider" && client.UserID != "" {
// 				s.providers[client.UserID] = client
// 				log.Printf("👷 Provider registered: %s (%s)", client.UserID, client.Service)
				
// 				// Send existing pending requests to new provider
// 				go s.sendPendingRequestsToProvider(client)
// 			} else if client.UserType == "customer" && client.UserID != "" {
// 				s.customers[client.UserID] = client
// 				log.Printf("👤 Customer registered: %s", client.UserID)
// 			}
			
// 			s.mu.Unlock()
// 			log.Printf("✅ Client connected. Total: %d (Providers: %d, Customers: %d)", 
// 				len(s.clients), len(s.providers), len(s.customers))

// 		case client := <-s.unregister:
// 			s.mu.Lock()
// 			if _, ok := s.clients[client]; ok {
// 				delete(s.clients, client)
// 				close(client.Send)
				
// 				// Remove from user maps
// 				if client.UserType == "provider" && client.UserID != "" {
// 					delete(s.providers, client.UserID)
// 				} else if client.UserType == "customer" && client.UserID != "" {
// 					delete(s.customers, client.UserID)
// 				}
				
// 				// Remove from all rooms
// 				for room := range s.rooms {
// 					delete(s.rooms[room], client)
// 				}
// 			}
// 			s.mu.Unlock()
// 			log.Printf("❌ Client disconnected. Total: %d", len(s.clients))

// 		case message := <-s.broadcast:
// 			s.mu.RLock()
// 			for client := range s.clients {
// 				select {
// 				case client.Send <- message:
// 				default:
// 					close(client.Send)
// 					delete(s.clients, client)
// 				}
// 			}
// 			s.mu.RUnlock()
// 		}
// 	}
// }

// // ==================== WEB SOCKET HANDLERS ====================
// func handleConnections(w http.ResponseWriter, r *http.Request) {
// 	// Rate limiting check
// 	if len(server.clients) >= MaxClients {
// 		http.Error(w, "Server at maximum capacity", http.StatusServiceUnavailable)
// 		return
// 	}

// 	conn, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Printf("Upgrade error: %v", err)
// 		return
// 	}

// 	// Get user info from query params
// 	userType := r.URL.Query().Get("type")
// 	userID := r.URL.Query().Get("user_id")
// 	service := r.URL.Query().Get("service")
// 	name := r.URL.Query().Get("name")

// 	// Set defaults if empty
// 	if userType == "" {
// 		userType = "anonymous"
// 	}
// 	if userID == "" {
// 		userID = "user_" + generateClientID(r)
// 	}
// 	if name == "" {
// 		name = "Anonymous"
// 	}

// 	client := &Client{
// 		Conn:     conn,
// 		Send:     make(chan []byte, 256),
// 		ID:       generateClientID(r),
// 		UserType: userType,
// 		UserID:   userID,
// 		Service:  service,
// 	}

// 	// Register client
// 	server.register <- client

// 	// Send welcome message
// 	welcomeMsg := Message{
// 		Event: "welcome",
// 		Data:  json.RawMessage(`{"message":"Connected to Dastak PK WebSocket","type":"` + userType + `","name":"` + name + `"}`),
// 		Timestamp: time.Now().Unix(),
// 	}
// 	sendToClient(client, welcomeMsg)

// 	// If provider, announce to system
// 	if userType == "provider" && userID != "" && service != "" {
// 		providerMsg := Message{
// 			Event: "provider_online",
// 			Data: json.RawMessage(`{"provider_id":"` + userID + `","name":"` + name + `","service":"` + service + `"}`),
// 			Timestamp: time.Now().Unix(),
// 		}
// 		broadcastToAll(providerMsg)
// 	}

// 	// Start goroutines
// 	go client.writePump()
// 	go client.readPump()
// }

// func (c *Client) readPump() {
// 	defer func() {
// 		server.unregister <- c
// 		c.Conn.Close()
// 	}()

// 	c.Conn.SetReadLimit(MaxMsgSize)
// 	// SET READ DEADLINE - FIX FOR 1005 ERROR
// 	c.Conn.SetReadDeadline(time.Now().Add(PongWait))
// 	c.Conn.SetPongHandler(func(string) error {
// 		// Reset read deadline on pong
// 		c.Conn.SetReadDeadline(time.Now().Add(PongWait))
// 		return nil
// 	})

// 	for {
// 		_, message, err := c.Conn.ReadMessage()
// 		if err != nil {
// 			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
// 				log.Printf("Read error: %v", err)
// 			}
// 			break
// 		}

// 		processMessage(c, message)
// 	}
// }

// func (c *Client) writePump() {
// 	// ADD TICKER FOR PING MESSAGES
// 	ticker := time.NewTicker(PingInterval)
// 	defer func() {
// 		ticker.Stop()
// 		c.Conn.Close()
// 	}()

// 	for {
// 		select {
// 		case message, ok := <-c.Send:
// 			c.Conn.SetWriteDeadline(time.Now().Add(WriteWait))
// 			if !ok {
// 				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
// 				return
// 			}

// 			w, err := c.Conn.NextWriter(websocket.TextMessage)
// 			if err != nil {
// 				return
// 			}
// 			w.Write(message)

// 			if err := w.Close(); err != nil {
// 				return
// 			}

// 		case <-ticker.C:
// 			// SEND PING TO KEEP CONNECTION ALIVE
// 			c.Conn.SetWriteDeadline(time.Now().Add(WriteWait))
// 			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
// 				return
// 			}
// 		}
// 	}
// }

// // ==================== MESSAGE PROCESSING ====================
// func processMessage(c *Client, msg []byte) {
// 	var message Message
// 	if err := json.Unmarshal(msg, &message); err != nil {
// 		log.Printf("Invalid JSON: %v", err)
// 		return
// 	}

// 	message.Timestamp = time.Now().Unix()

// 	switch message.Event {
// 	case "create_request":
// 		handleCreateRequest(c, message)
// 	case "request_accepted":
// 		handleRequestAccepted(c, message)
// 	case "join_room":
// 		handleJoinRoom(c, message.Room)
// 	case "leave_room":
// 		handleLeaveRoom(c, message.Room)
// 	case "provider_online":
// 		handleProviderOnline(c, message)
// 	case "get_pending_requests":
// 		handleGetPendingRequests(c)
// 	case "ping":
// 		sendToClient(c, Message{Event: "pong", Timestamp: time.Now().Unix()})
// 	default:
// 		log.Printf("Unknown event: %s", message.Event)
// 	}
// }

// func handleCreateRequest(c *Client, msg Message) {
// 	var requestData struct {
// 		ID          string `json:"id"`
// 		Title       string `json:"title"`
// 		Description string `json:"description"`
// 		Location    string `json:"location"`
// 		Budget      string `json:"budget"`
// 		CustomerID  string `json:"customer_id"`
// 		Customer    string `json:"customer_name"`
// 		ServiceType string `json:"service_type"`
// 		Schedule    string `json:"schedule"`
// 		Contact     string `json:"contact_number"`
// 		Timestamp   int64  `json:"timestamp"`
// 	}

// 	if err := json.Unmarshal(msg.Data, &requestData); err != nil {
// 		log.Printf("Invalid request data: %v", err)
// 		return
// 	}

// 	// Generate request ID if not provided
// 	requestID := requestData.ID
// 	if requestID == "" {
// 		requestID = "req_" + time.Now().Format("20060102150405") + "_" + randomString(6)
// 	}

// 	// Create service request
// 	request := ServiceRequest{
// 		ID:          requestID,
// 		Title:       requestData.Title,
// 		Description: requestData.Description,
// 		Location:    requestData.Location,
// 		Budget:      requestData.Budget,
// 		CustomerID:  requestData.CustomerID,
// 		Customer:    requestData.Customer,
// 		Status:      "pending",
// 		ServiceType: requestData.ServiceType,
// 		Schedule:    requestData.Schedule,
// 		Contact:     requestData.Contact,
// 		CreatedAt:   time.Now().Unix(),
// 		UpdatedAt:   time.Now().Unix(),
// 		RawData:     msg.Data,
// 	}

// 	// Store request
// 	server.mu.Lock()
// 	server.requests[requestID] = request
// 	server.allRequests = append(server.allRequests, request)
// 	server.mu.Unlock()

// 	// Send confirmation to customer
// 	sendToClient(c, Message{
// 		Event:     "request_created",
// 		Data:      json.RawMessage(`{"id":"` + requestID + `","status":"pending","message":"Request created successfully"}`),
// 		Timestamp: time.Now().Unix(),
// 	})

// 	// Broadcast to ALL providers
// 	broadcastToProviders(Message{
// 		Event:     "new_request",
// 		Data:      msg.Data,
// 		Timestamp: time.Now().Unix(),
// 	})

// 	// Also broadcast to specific service type providers
// 	broadcastToServiceProviders(requestData.ServiceType, Message{
// 		Event:     "new_request_" + requestData.ServiceType,
// 		Data:      msg.Data,
// 		Timestamp: time.Now().Unix(),
// 	})

// 	log.Printf("✅ Request created: %s - %s by %s", requestID, requestData.Title, requestData.Customer)
// 	log.Printf("📢 Broadcasted to %d providers", len(server.providers))
// }

// func handleRequestAccepted(c *Client, msg Message) {
// 	var acceptData struct {
// 		RequestID   string `json:"request_id"`
// 		ProviderID  string `json:"provider_id"`
// 		Provider    string `json:"provider_name"`
// 		Message     string `json:"message"`
// 	}

// 	if err := json.Unmarshal(msg.Data, &acceptData); err != nil {
// 		log.Printf("Invalid accept data: %v", err)
// 		return
// 	}

// 	server.mu.Lock()
// 	request, exists := server.requests[acceptData.RequestID]
// 	if !exists {
// 		server.mu.Unlock()
// 		log.Printf("Request not found: %s", acceptData.RequestID)
// 		return
// 	}

// 	// Update request status
// 	request.Status = "accepted"
// 	request.UpdatedAt = time.Now().Unix()
// 	server.requests[acceptData.RequestID] = request
	
// 	// Update in allRequests
// 	for i, req := range server.allRequests {
// 		if req.ID == acceptData.RequestID {
// 			server.allRequests[i].Status = "accepted"
// 			server.allRequests[i].UpdatedAt = time.Now().Unix()
// 			break
// 		}
// 	}
// 	server.mu.Unlock()

// 	// Notify customer
// 	if customer, ok := server.customers[request.CustomerID]; ok {
// 		sendToClient(customer, Message{
// 			Event: "request_accepted",
// 			Data: json.RawMessage(`{"request_id":"` + acceptData.RequestID + `","provider":"` + acceptData.Provider + `","message":"Your request has been accepted"}`),
// 			Timestamp: time.Now().Unix(),
// 		})
// 	}

// 	// Notify all providers that request is taken
// 	broadcastToProviders(Message{
// 		Event: "request_taken",
// 		Data: json.RawMessage(`{"request_id":"` + acceptData.RequestID + `","provider":"` + acceptData.Provider + `"}`),
// 		Timestamp: time.Now().Unix(),
// 	})

// 	log.Printf("✅ Request %s accepted by provider %s", acceptData.RequestID, acceptData.Provider)
// }

// func handleProviderOnline(c *Client, msg Message) {
// 	var providerData struct {
// 		ProviderID string `json:"provider_id"`
// 		Name       string `json:"name"`
// 		Service    string `json:"service"`
// 	}

// 	if err := json.Unmarshal(msg.Data, &providerData); err != nil {
// 		log.Printf("Invalid provider data: %v", err)
// 		return
// 	}

// 	// Update client info
// 	c.UserType = "provider"
// 	c.UserID = providerData.ProviderID
// 	c.Service = providerData.Service

// 	// Send pending requests to this provider
// 	go server.sendPendingRequestsToProvider(c)

// 	log.Printf("👷 Provider online: %s (%s)", providerData.Name, providerData.Service)
// }

// func handleGetPendingRequests(c *Client) {
// 	server.mu.RLock()
// 	var pendingRequests []ServiceRequest
// 	for _, req := range server.requests {
// 		if req.Status == "pending" {
// 			pendingRequests = append(pendingRequests, req)
// 		}
// 	}
// 	server.mu.RUnlock()

// 	requestsJSON, _ := json.Marshal(pendingRequests)
	
// 	sendToClient(c, Message{
// 		Event:     "pending_requests",
// 		Data:      requestsJSON,
// 		Timestamp: time.Now().Unix(),
// 	})
// }

// func handleJoinRoom(c *Client, room string) {
// 	if room == "" {
// 		return
// 	}

// 	server.mu.Lock()
// 	if server.rooms[room] == nil {
// 		server.rooms[room] = make(map[*Client]bool)
// 	}
// 	server.rooms[room][c] = true
// 	server.mu.Unlock()

// 	sendToClient(c, Message{
// 		Event:     "joined_room",
// 		Room:      room,
// 		Timestamp: time.Now().Unix(),
// 	})
// }

// func handleLeaveRoom(c *Client, room string) {
// 	server.mu.Lock()
// 	delete(server.rooms[room], c)
// 	if len(server.rooms[room]) == 0 {
// 		delete(server.rooms, room)
// 	}
// 	server.mu.Unlock()
// }

// // ==================== HELPER FUNCTIONS ====================
// func (s *Server) sendPendingRequestsToProvider(client *Client) {
// 	s.mu.RLock()
// 	var pendingRequests []ServiceRequest
	
// 	// Get requests matching provider's service or all if no service specified
// 	for _, req := range s.requests {
// 		if req.Status == "pending" {
// 			if client.Service == "" || client.Service == "all" || req.ServiceType == client.Service {
// 				pendingRequests = append(pendingRequests, req)
// 			}
// 		}
// 	}
// 	s.mu.RUnlock()

// 	if len(pendingRequests) > 0 {
// 		requestsJSON, _ := json.Marshal(pendingRequests)
		
// 		sendToClient(client, Message{
// 			Event:     "initial_requests",
// 			Data:      requestsJSON,
// 			Timestamp: time.Now().Unix(),
// 		})
		
// 		log.Printf("📨 Sent %d pending requests to provider %s", len(pendingRequests), client.UserID)
// 	}
// }

// func broadcastToProviders(msg Message) {
// 	server.mu.RLock()
// 	msgBytes, _ := json.Marshal(msg)
	
// 	for _, provider := range server.providers {
// 		select {
// 		case provider.Send <- msgBytes:
// 			// Sent successfully
// 		default:
// 			// Channel full, skip
// 		}
// 	}
// 	server.mu.RUnlock()
// }

// func broadcastToServiceProviders(serviceType string, msg Message) {
// 	server.mu.RLock()
// 	msgBytes, _ := json.Marshal(msg)
	
// 	for _, provider := range server.providers {
// 		if provider.Service == "" || provider.Service == "all" || provider.Service == serviceType {
// 			select {
// 			case provider.Send <- msgBytes:
// 				// Sent successfully
// 			default:
// 				// Channel full, skip
// 			}
// 		}
// 	}
// 	server.mu.RUnlock()
// }

// func broadcastToAll(msg Message) {
// 	msgBytes, _ := json.Marshal(msg)
// 	server.broadcast <- msgBytes
// }

// func sendToClient(c *Client, msg Message) {
// 	msgBytes, _ := json.Marshal(msg)
	
// 	select {
// 	case c.Send <- msgBytes:
// 		// Sent successfully
// 	default:
// 		// Channel full
// 	}
// }

// func generateClientID(r *http.Request) string {
// 	return time.Now().Format("20060102150405") + "_" + r.RemoteAddr
// }

// func randomString(n int) string {
// 	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
// 	b := make([]byte, n)
// 	for i := range b {
// 		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
// 	}
// 	return string(b)
// }

// // ==================== HTTP HANDLERS ====================
// func healthHandler(w http.ResponseWriter, r *http.Request) {
// 	server.mu.RLock()
// 	stats := map[string]interface{}{
// 		"status":           "healthy",
// 		"total_clients":    len(server.clients),
// 		"providers_online": len(server.providers),
// 		"customers_online": len(server.customers),
// 		"pending_requests": len(server.requests),
// 		"timestamp":        time.Now().Unix(),
// 		"uptime":           time.Since(startTime).String(),
// 	}
// 	server.mu.RUnlock()

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(stats)
// }

// func statsHandler(w http.ResponseWriter, r *http.Request) {
// 	server.mu.RLock()
// 	stats := map[string]interface{}{
// 		"clients":     len(server.clients),
// 		"providers":   len(server.providers),
// 		"customers":   len(server.customers),
// 		"requests":    len(server.requests),
// 		"all_requests_count": len(server.allRequests),
		
// 		"provider_list": getProviderList(),
// 		"recent_requests": getRecentRequests(10),
// 	}
// 	server.mu.RUnlock()

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(stats)
// }

// func getProviderList() []Provider {
// 	var providers []Provider
// 	for _, client := range server.providers {
// 		providers = append(providers, Provider{
// 			ID:      client.UserID,
// 			Name:    "Provider " + client.UserID[len(client.UserID)-4:],
// 			Service: client.Service,
// 			Online:  true,
// 		})
// 	}
// 	return providers
// }

// func getRecentRequests(limit int) []ServiceRequest {
// 	if limit > len(server.allRequests) {
// 		limit = len(server.allRequests)
// 	}
// 	start := len(server.allRequests) - limit
// 	if start < 0 {
// 		start = 0
// 	}
// 	return server.allRequests[start:]
// }

// // ==================== MAIN FUNCTION ====================
// var startTime time.Time

// func startServer() {
// 	port := os.Getenv("PORT")
// 	if port == "" {
// 		port = DefaultPort
// 	}

// 	startTime = time.Now()

// 	// Start server goroutine
// 	go server.run()

// 	// HTTP endpoints
// 	http.HandleFunc("/ws", handleConnections)
// 	http.HandleFunc("/health", healthHandler)
// 	http.HandleFunc("/stats", statsHandler)
	
// 	// Test endpoint for debugging
// 	http.HandleFunc("/test-broadcast", func(w http.ResponseWriter, r *http.Request) {
// 		testMsg := Message{
// 			Event: "test_message",
// 			Data:  json.RawMessage(`{"message":"Test broadcast from server"}`),
// 			Timestamp: time.Now().Unix(),
// 		}
// 		broadcastToAll(testMsg)
// 		w.Write([]byte("Test message broadcasted"))
// 	})

// 	// Simple homepage
// 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// 		w.Write([]byte("Dastak PK WebSocket Server is running on /ws endpoint"))
// 	})

// 	log.Printf("🚀 Dastak PK WebSocket Server starting on :%s", port)
// 	log.Printf("📡 Max Clients: %d | Max Message Size: %d bytes", MaxClients, MaxMsgSize)
// 	log.Printf("🔧 Ready for real-time customer-provider communication")
	
// 	if err := http.ListenAndServe(":"+port, nil); err != nil {
// 		log.Fatal("Server failed: ", err)
// 	}
// }

// func main() {
// 	startServer()
// }