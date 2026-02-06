package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
	"sync"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

var (
	requestsDB = make(map[string]Request)
	usersDB    = make(map[string]User)
	mu         sync.RWMutex
)

type Request struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	Amount      float64   `json:"amount"`
	CustomerID  string    `json:"customer_id"`
	Customer    string    `json:"customer"`
	Status      string    `json:"status"`
	ServiceType string    `json:"service_type"`
	Schedule    string    `json:"schedule"`
	Contact     string    `json:"contact"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	UserType  string    `json:"user_type"` // customer, worker
	CreatedAt time.Time `json:"created_at"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func main() {
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}

	r := mux.NewRouter()

	// Middleware
	r.Use(loggingMiddleware)
	r.Use(recoveryMiddleware)

	// Health check
	r.HandleFunc("/api/health", healthHandler).Methods("GET")

	// Auth endpoints
	r.HandleFunc("/api/auth/register", registerHandler).Methods("POST")
	r.HandleFunc("/api/auth/login", loginHandler).Methods("POST")
	r.HandleFunc("/api/auth/verify", verifyTokenHandler).Methods("GET")

	// Requests endpoints
	r.HandleFunc("/api/requests", getRequestsHandler).Methods("GET")
	r.HandleFunc("/api/requests", createRequestHandler).Methods("POST")
	r.HandleFunc("/api/requests/{id}", getRequestHandler).Methods("GET")
	r.HandleFunc("/api/requests/{id}/accept", acceptRequestHandler).Methods("POST")
	r.HandleFunc("/api/requests/{id}/complete", completeRequestHandler).Methods("POST")

	// User endpoints
	r.HandleFunc("/api/users/{id}", getUserHandler).Methods("GET")
	r.HandleFunc("/api/users/{id}/requests", getUserRequestsHandler).Methods("GET")

	// Payments endpoint (stub)
	r.HandleFunc("/api/payments/create", createPaymentHandler).Methods("POST")
	r.HandleFunc("/api/payments/verify", verifyPaymentHandler).Methods("POST")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://dastak.pk"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	handler := c.Handler(r)

	log.Printf("🚀 REST API Server starting on :%s", port)
	log.Printf("📡 Environment: %s", os.Getenv("ENV"))
	
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("API Server failed: ", err)
	}
}

// ==================== HANDLERS ====================

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := APIResponse{
		Success: true,
		Message: "API is healthy",
		Data: map[string]interface{}{
			"timestamp": time.Now().Unix(),
			"version":   "1.0.0",
			"requests":  len(requestsDB),
			"users":     len(usersDB),
		},
	}
	jsonResponse(w, http.StatusOK, response)
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var user struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
		Phone    string `json:"phone"`
		UserType string `json:"user_type"`
	}

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		jsonError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate
	if user.Email == "" || user.Password == "" || user.Name == "" {
		jsonError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	// Check if user exists
	for _, u := range usersDB {
		if u.Email == user.Email {
			jsonError(w, http.StatusConflict, "Email already registered")
			return
		}
	}

	// Create user
	userID := "user_" + time.Now().Format("20060102150405")
	newUser := User{
		ID:        userID,
		Email:     user.Email,
		Name:      user.Name,
		Phone:     user.Phone,
		UserType:  user.UserType,
		CreatedAt: time.Now(),
	}

	usersDB[userID] = newUser

	// Generate JWT token (simplified)
	token := generateToken(userID)

	response := APIResponse{
		Success: true,
		Message: "Registration successful",
		Data: map[string]interface{}{
			"user":  newUser,
			"token": token,
		},
	}
	jsonResponse(w, http.StatusCreated, response)
}

func createRequestHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Location    string  `json:"location"`
		Amount      float64 `json:"amount"`
		CustomerID  string  `json:"customer_id"`
		ServiceType string  `json:"service_type"`
		Schedule    string  `json:"schedule"`
		Contact     string  `json:"contact"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate
	if req.Title == "" || req.Location == "" || req.CustomerID == "" {
		jsonError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	// Create request
	requestID := "req_" + time.Now().Format("20060102150405")
	newRequest := Request{
		ID:          requestID,
		Title:       req.Title,
		Description: req.Description,
		Location:    req.Location,
		Amount:      req.Amount,
		CustomerID:  req.CustomerID,
		Customer:    "Customer " + req.CustomerID[len(req.CustomerID)-4:],
		Status:      "pending",
		ServiceType: req.ServiceType,
		Schedule:    req.Schedule,
		Contact:     req.Contact,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	requestsDB[requestID] = newRequest

	response := APIResponse{
		Success: true,
		Message: "Request created successfully",
		Data:    newRequest,
	}
	jsonResponse(w, http.StatusCreated, response)
}

func getRequestsHandler(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	limitStr := r.URL.Query().Get("limit")
	limit := 50

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	mu.RLock()
	defer mu.RUnlock()

	var requests []Request
	count := 0

	for _, req := range requestsDB {
		if status == "" || req.Status == status {
			requests = append(requests, req)
			count++
			if count >= limit {
				break
			}
		}
	}

	response := APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"requests": requests,
			"total":    len(requestsDB),
			"count":    len(requests),
		},
	}
	jsonResponse(w, http.StatusOK, response)
}

func acceptRequestHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	requestID := vars["id"]

	var data struct {
		WorkerID string `json:"worker_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		jsonError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	req, exists := requestsDB[requestID]
	if !exists {
		jsonError(w, http.StatusNotFound, "Request not found")
		return
	}

	if req.Status != "pending" {
		jsonError(w, http.StatusBadRequest, "Request already "+req.Status)
		return
	}

	req.Status = "accepted"
	req.UpdatedAt = time.Now()
	requestsDB[requestID] = req

	response := APIResponse{
		Success: true,
		Message: "Request accepted successfully",
		Data:    req,
	}
	jsonResponse(w, http.StatusOK, response)
}

// ==================== HELPER FUNCTIONS ====================

func jsonResponse(w http.ResponseWriter, status int, response APIResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}

func jsonError(w http.ResponseWriter, status int, message string) {
	jsonResponse(w, status, APIResponse{
		Success: false,
		Error:   message,
	})
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("%s %s %s", r.Method, r.RequestURI, r.RemoteAddr)
		next.ServeHTTP(w, r)
		log.Printf("Completed in %v", time.Since(start))
	})
}

func recoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("PANIC recovered: %v", err)
				jsonError(w, http.StatusInternalServerError, "Internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func generateToken(userID string) string {
	// In production, use proper JWT implementation
	return "jwt_" + userID + "_" + time.Now().Format("20060102150405")
}

// Stub handlers for other endpoints
func loginHandler(w http.ResponseWriter, r *http.Request)           { /* Implement */ }
func verifyTokenHandler(w http.ResponseWriter, r *http.Request)     { /* Implement */ }
func getRequestHandler(w http.ResponseWriter, r *http.Request)      { /* Implement */ }
func completeRequestHandler(w http.ResponseWriter, r *http.Request) { /* Implement */ }
func getUserHandler(w http.ResponseWriter, r *http.Request)         { /* Implement */ }
func getUserRequestsHandler(w http.ResponseWriter, r *http.Request) { /* Implement */ }
func createPaymentHandler(w http.ResponseWriter, r *http.Request)   { /* Implement */ }
func verifyPaymentHandler(w http.ResponseWriter, r *http.Request)   { /* Implement */ }