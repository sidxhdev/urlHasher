package models

import "time"

type URL struct {
	ID           string    `json:"id"`
	OriginalURL  string    `json:"original_url"`
	ShortURL     string    `json:"short_url"`
	CreationDate time.Time `json:"creation_date"`
	ClickCount   int       `json:"click_count"`
}

type CreateURLRequest struct {
	URL string `json:"url"`
}

type CreateURLResponse struct {
	ShortURL string `json:"short_url"`
	FullURL  string `json:"full_url"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}