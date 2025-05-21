package main

import (
	"log"
	"net/http"
	"os"

	"bookshop/cart_service/database"
	"bookshop/cart_service/handlers"
	"bookshop/cart_service/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (
	bookServiceURL string
	authServiceURL string
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize MongoDB connection
	mongodbURI := getEnv("MONGODB_URI", "mongodb://localhost:27017")
	mongodbDB := getEnv("MONGODB_DB", "bookshop")
	
	if err := database.InitDB(mongodbURI, mongodbDB); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.CloseDB()

	// Get service URLs from environment variables
	bookServiceURL = getEnv("BOOK_SERVICE_URL", "http://localhost:8002")
	authServiceURL = getEnv("AUTH_SERVICE_URL", "http://localhost:8001")

	// Initialize book service
	handlers.InitializeBookService(bookServiceURL)

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(corsMiddleware())

	// Routes
	r.GET("/health", healthCheck)
	
	// Cart routes
	r.Use(middleware.AuthMiddleware())
	r.GET("/", handlers.GetCart)
	r.POST("/items", handlers.AddToCart)
	r.PUT("/items/:itemId", handlers.UpdateCartItem)
	r.DELETE("/items/:itemId", handlers.RemoveFromCart)
	r.DELETE("/", handlers.ClearCart)

	// Start server
	port := getEnv("PORT", "8003")
	log.Printf("Cart service running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "*")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "*")
		c.Writer.Header().Set("Access-Control-Max-Age", "3600")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	}
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "cart-service",
	})
} 