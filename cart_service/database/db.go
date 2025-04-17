package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"bookshop/cart_service/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	client        *mongo.Client
	db            *mongo.Database
	cartCollection *mongo.Collection
)

// InitDB initializes the MongoDB connection
func InitDB(mongoURI, dbName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set client options
	clientOptions := options.Client().ApplyURI(mongoURI).
		SetMaxPoolSize(100).                    // Set maximum pool size
		SetMinPoolSize(5).                      // Set minimum pool size
		SetMaxConnIdleTime(5 * time.Minute).    // Set maximum connection idle time
		SetRetryWrites(true).                   // Enable retry on write operations
		SetRetryReads(true)                     // Enable retry on read operations

	// Connect to MongoDB
	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Ping the database to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	// Set database and collection
	db = client.Database(dbName)
	cartCollection = db.Collection("carts")

	log.Println("Successfully connected to MongoDB")
	return nil
}

// CloseDB closes the MongoDB connection
func CloseDB() error {
	if client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := client.Disconnect(ctx); err != nil {
			return fmt.Errorf("failed to disconnect from MongoDB: %v", err)
		}
	}
	return nil
}

// GetCart retrieves a user's cart from the database
func GetCart(userID string) (*models.Cart, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cart models.Cart
	err := cartCollection.FindOne(ctx, bson.M{"userId": userID}).Decode(&cart)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Create a new cart if none exists
			cart = models.Cart{
				UserID:    userID,
				Items:     []models.CartItem{},
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			_, err = cartCollection.InsertOne(ctx, cart)
			if err != nil {
				return nil, fmt.Errorf("failed to create new cart: %v", err)
			}
			return &cart, nil
		}
		return nil, fmt.Errorf("failed to get cart: %v", err)
	}

	return &cart, nil
}

// UpdateCart updates a user's cart in the database
func UpdateCart(cart *models.Cart) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cart.UpdatedAt = time.Now()
	_, err := cartCollection.ReplaceOne(
		ctx,
		bson.M{"userId": cart.UserID},
		cart,
		options.Replace().SetUpsert(true),
	)
	if err != nil {
		return fmt.Errorf("failed to update cart: %v", err)
	}

	return nil
}

// AddToCart adds an item to a user's cart
func AddToCart(userID string, item models.CartItem) error {
	cart, err := GetCart(userID)
	if err != nil {
		return err
	}

	// Check if item already exists in cart
	for i, existingItem := range cart.Items {
		if existingItem.BookID == item.BookID {
			cart.Items[i].Quantity += item.Quantity
			return UpdateCart(cart)
		}
	}

	// Add new item
	cart.Items = append(cart.Items, item)
	return UpdateCart(cart)
}

// UpdateCartItem updates the quantity of an item in the cart
func UpdateCartItem(userID string, itemID primitive.ObjectID, quantity int) error {
	cart, err := GetCart(userID)
	if err != nil {
		return err
	}

	for i, item := range cart.Items {
		if item.ID == itemID {
			cart.Items[i].Quantity = quantity
			return UpdateCart(cart)
		}
	}

	return fmt.Errorf("item not found in cart")
}

// RemoveFromCart removes an item from the cart
func RemoveFromCart(userID string, itemID primitive.ObjectID) error {
	cart, err := GetCart(userID)
	if err != nil {
		return err
	}

	for i, item := range cart.Items {
		if item.ID == itemID {
			cart.Items = append(cart.Items[:i], cart.Items[i+1:]...)
			return UpdateCart(cart)
		}
	}

	return fmt.Errorf("item not found in cart")
}

// ClearCart removes all items from a user's cart
func ClearCart(userID string) error {
	cart, err := GetCart(userID)
	if err != nil {
		return err
	}

	cart.Items = []models.CartItem{}
	return UpdateCart(cart)
} 