package services

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type BookService struct {
	baseURL string
}

type Book struct {
	ID          string  `json:"_id"`
	Title       string  `json:"title"`
	Author      string  `json:"author"`
	Price       float64 `json:"price"`
	ImageURL    string  `json:"imageUrl"`
	Description string  `json:"description"`
}

type BookResponse struct {
	Success bool `json:"success"`
	Data    Book `json:"data"`
}

func NewBookService(baseURL string) *BookService {
	return &BookService{
		baseURL: baseURL,
	}
}

func (s *BookService) GetBookByID(bookID string) (*Book, error) {
	url := fmt.Sprintf("%s/%s", s.baseURL, bookID)
	
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch book: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("book service returned status code: %d", resp.StatusCode)
	}

	var bookResp BookResponse
	if err := json.NewDecoder(resp.Body).Decode(&bookResp); err != nil {
		return nil, fmt.Errorf("failed to decode book response: %v", err)
	}

	if !bookResp.Success {
		return nil, fmt.Errorf("book service returned error")
	}

	return &bookResp.Data, nil
} 