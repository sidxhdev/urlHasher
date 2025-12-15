package repository

import (
	"database/sql"
	"fmt"

	"urlHasher/server/internal/models"
)

type URLRepository interface {
	Create(url *models.URL) error
	FindByID(id string) (*models.URL, error)
	FindByOriginalURL(originalURL string) (*models.URL, error)
	FindAll() ([]*models.URL, error)
	IncrementClickCount(id string) error
	Delete(id string) error
}

type urlRepository struct {
	db *sql.DB
}

func NewURLRepository(db *sql.DB) URLRepository {
	return &urlRepository{db: db}
}

func (r *urlRepository) Create(url *models.URL) error {
	query := `
		INSERT INTO urls (id, original_url, short_url, creation_date, click_count) 
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.db.Exec(query, url.ID, url.OriginalURL, url.ShortURL, url.CreationDate, url.ClickCount)
	if err != nil {
		return fmt.Errorf("failed to create URL: %w", err)
	}
	return nil
}

func (r *urlRepository) FindByID(id string) (*models.URL, error) {
	url := &models.URL{}
	query := `
		SELECT id, original_url, short_url, creation_date, click_count 
		FROM urls WHERE id = $1
	`

	err := r.db.QueryRow(query, id).Scan(&url.ID, &url.OriginalURL, &url.ShortURL, &url.CreationDate, &url.ClickCount)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("URL not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find URL: %w", err)
	}

	return url, nil
}

func (r *urlRepository) FindByOriginalURL(originalURL string) (*models.URL, error) {
	url := &models.URL{}
	query := `
		SELECT id, original_url, short_url, creation_date, click_count 
		FROM urls WHERE original_url = $1
	`

	err := r.db.QueryRow(query, originalURL).Scan(&url.ID, &url.OriginalURL, &url.ShortURL, &url.CreationDate, &url.ClickCount)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find URL: %w", err)
	}

	return url, nil
}

func (r *urlRepository) FindAll() ([]*models.URL, error) {
	query := `
		SELECT id, original_url, short_url, creation_date, click_count 
		FROM urls ORDER BY creation_date DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URLs: %w", err)
	}
	defer rows.Close()

	var urls []*models.URL
	for rows.Next() {
		url := &models.URL{}
		err := rows.Scan(&url.ID, &url.OriginalURL, &url.ShortURL, &url.CreationDate, &url.ClickCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan URL: %w", err)
		}
		urls = append(urls, url)
	}

	return urls, nil
}

func (r *urlRepository) IncrementClickCount(id string) error {
	query := `UPDATE urls SET click_count = click_count + 1 WHERE id = $1`
	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to increment click count: %w", err)
	}
	return nil
}

func (r *urlRepository) Delete(id string) error {
	query := `DELETE FROM urls WHERE id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete URL: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check deletion: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("URL not found")
	}

	return nil
}