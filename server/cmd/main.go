package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"urlHasher/server/internal/config"
	"urlHasher/server/internal/controllers"
	"urlHasher/server/internal/database"
	"urlHasher/server/internal/middleware"
	"urlHasher/server/internal/repository"
	"urlHasher/server/internal/services"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer database.CloseDB()

	// Dependency injection
	urlRepo := repository.NewURLRepository(db)
	urlService := services.NewURLService(urlRepo)
	urlController := controllers.NewURLController(urlService)

	// Router
	r := chi.NewRouter()

	// Global middlewares
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(middleware.CORS)

	// Routes
	r.Get("/api/health", urlController.HealthCheck)
	r.Post("/api/shorten", urlController.CreateShortURL)
	r.Get("/api/urls", urlController.GetAllURLs)
	r.Get("/api/urls/{id}", urlController.GetURLByID)
	r.Get("/redirect/{id}", urlController.RedirectURL)

	// Start server (IPv4 + IPv6 safe)
	addr := "0.0.0.0:" + cfg.Port
	fmt.Printf("Server starting on %s\n", addr)

	log.Fatal(http.ListenAndServe(addr, r))
}
