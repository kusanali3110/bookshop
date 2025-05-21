package handlers

import (
	"fmt"
	"net/http"

	"bookshop/cart_service/database"
	"bookshop/cart_service/models"
	"bookshop/cart_service/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var bookService *services.BookService

// InitializeBookService initializes the book service client
func InitializeBookService(baseURL string) {
	bookService = services.NewBookService(baseURL)
}

// GetCart retrieves the user's cart
func GetCart(c *gin.Context) {
	userID, _ := c.Get("userID")
	userIDStr, _ := userID.(string)

	cart, err := database.GetCart(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    cart,
	})
}

// AddToCart adds an item to the user's cart
func AddToCart(c *gin.Context) {
	userID, _ := c.Get("userID")
	userIDStr, _ := userID.(string)

	var req models.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	// Fetch book details from book service
	book, err := bookService.GetBookByID(req.BookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Failed to fetch book details: %v", err),
		})
		return
	}

	item := models.CartItem{
		ID:       primitive.NewObjectID(),
		BookID:   req.BookID,
		Quantity: req.Quantity,
		Price:    book.Price,
		Title:    book.Title,
		ImageURL: book.ImageURL,
	}

	if err := database.AddToCart(userIDStr, item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message": "Item added to cart",
			"item":    item,
		},
	})
}

// UpdateCartItem updates the quantity of an item in the cart
func UpdateCartItem(c *gin.Context) {
	userID, _ := c.Get("userID")
	userIDStr, _ := userID.(string)

	itemIDStr := c.Param("itemId")
	itemID, err := primitive.ObjectIDFromHex(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid item ID",
		})
		return
	}

	var req models.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := database.UpdateCartItem(userIDStr, itemID, req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message": "Cart item updated",
		},
	})
}

// RemoveFromCart removes an item from the cart
func RemoveFromCart(c *gin.Context) {
	userID, _ := c.Get("userID")
	userIDStr, _ := userID.(string)

	itemIDStr := c.Param("itemId")
	itemID, err := primitive.ObjectIDFromHex(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid item ID",
		})
		return
	}

	if err := database.RemoveFromCart(userIDStr, itemID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message": "Item removed from cart",
		},
	})
}

// ClearCart removes all items from the cart
func ClearCart(c *gin.Context) {
	userID, _ := c.Get("userID")
	userIDStr, _ := userID.(string)

	if err := database.ClearCart(userIDStr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message": "Cart cleared",
		},
	})
} 