package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"urlHasher/server/internal/config"
	"urlHasher/server/internal/models"
	"urlHasher/server/internal/services"
)

type URLController struct {
	service services.URLService
}

func NewURLController(service services.URLService) *URLController {
	return &URLController{service: service}
}

func (c *URLController) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"message": "urlHasher API is running",
	})
}

func (c *URLController) CreateShortURL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req models.CreateURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.URL == "" {
		respondError(w, http.StatusBadRequest, "URL is required")
		return
	}

	if !strings.HasPrefix(req.URL, "http://") && !strings.HasPrefix(req.URL, "https://") {
		respondError(w, http.StatusBadRequest, "URL must start with http:// or https://")
		return
	}

	url, err := c.service.CreateShortURL(req.URL)
	if err != nil {
		log.Printf("Error creating short URL: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to create short URL")
		return
	}

	cfg := config.LoadConfig()
	response := models.CreateURLResponse{
		ShortURL: url.ShortURL,
		FullURL:  cfg.BaseURL + "/redirect/" + url.ShortURL,
	}

	respondJSON(w, http.StatusCreated, response)
}

func (c *URLController) GetAllURLs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	urls, err := c.service.GetAllURLs()
	if err != nil {
		log.Printf("Error fetching URLs: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to fetch URLs")
		return
	}

	if urls == nil {
		urls = []*models.URL{}
	}

	respondJSON(w, http.StatusOK, urls)
}

func (c *URLController) GetURLByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/urls/")
	if id == "" || id == "/api/urls/" {
		respondError(w, http.StatusBadRequest, "URL ID is required")
		return
	}

	url, err := c.service.GetURLByID(id)
	if err != nil {
		respondError(w, http.StatusNotFound, "URL not found")
		return
	}

	respondJSON(w, http.StatusOK, url)
}

func (c *URLController) RedirectURL(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/redirect/")
	if id == "" {
		respondError(w, http.StatusBadRequest, "Short URL ID is required")
		return
	}

	url, err := c.service.GetURLByID(id)
	if err != nil {
		respondError(w, http.StatusNotFound, "URL not found")
		return
	}

	go func() {
		if err := c.service.RecordClick(id); err != nil {
			log.Printf("Error recording click: %v", err)
		}
	}()

	http.Redirect(w, r, url.OriginalURL, http.StatusFound)
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON: %v", err)
	}
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, models.ErrorResponse{Error: message})
}