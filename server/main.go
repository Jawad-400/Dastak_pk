package main

import (
	"log"
)

func main() {
	// Start WebSocket server in goroutine
	go func() {
		log.Println("Starting WebSocket server...")
		// Your existing socket-server.go code
		startSocketServer()
	}()
	
	// Start REST API server (main goroutine)
	log.Println("Starting REST API server...")
	startAPIServer()
}