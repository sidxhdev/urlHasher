package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	Port        string
	BaseURL     string
	Environment string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	config := &Config{
		DatabaseURL: getEnv("DATABASE_URL", ""),
		Port:        getEnv("PORT", "8080"),
		BaseURL:     getEnv("BASE_URL", "http://localhost:5000"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}

	if config.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	log.Println("✅ Configuration loaded")
	return config
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}