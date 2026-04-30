package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func InitDB(connStr string) (*sql.DB, error) {
	if connStr == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	log.Println("Database connected")

	err = createTables()
	if err != nil {
		return nil, err
	}

	return db, nil
}

func createTables() error {
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS urls (
		id VARCHAR(50) PRIMARY KEY,
		original_url TEXT NOT NULL,
		short_url VARCHAR(50) NOT NULL,
		creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		click_count INTEGER DEFAULT 0
	);
	CREATE INDEX IF NOT EXISTS idx_short_url ON urls(short_url);
	CREATE INDEX IF NOT EXISTS idx_original_url ON urls(original_url);
	`

	_, err := db.Exec(createTableSQL)
	if err != nil {
		return fmt.Errorf("error creating tables: %w", err)
	}

	log.Println("Tables ready")
	return nil
}

func CloseDB() {
	if db != nil {
		db.Close()
		log.Println(" Database closed")
	}
}