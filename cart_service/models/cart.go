package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Cart represents a user's shopping cart
type Cart struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID    string             `bson:"userId" json:"userId"`
	Items     []CartItem         `bson:"items" json:"items"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// CartItem represents an item in a cart
type CartItem struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	BookID   string             `bson:"bookId" json:"bookId"`
	Quantity int                `bson:"quantity" json:"quantity"`
	Price    float64            `bson:"price" json:"price"`
	Title    string             `bson:"title" json:"title"`
	ImageURL string             `bson:"imageUrl" json:"imageUrl"`
}

// AddToCartRequest represents the request to add an item to the cart
type AddToCartRequest struct {
	BookID   string `json:"bookId" binding:"required"`
	Quantity int    `json:"quantity" binding:"required,min=1"`
}

// UpdateCartItemRequest represents the request to update a cart item
type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

// CartResponse represents the response for cart operations
type CartResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    *Cart  `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
} 