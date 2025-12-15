package services

import (
	"fmt"
	"time"

	"urlHasher/server/internal/models"
	"urlHasher/server/internal/repository"
	"urlHasher/server/pkg/utils"
)

type URLService interface {
	CreateShortURL(originalURL string) (*models.URL, error)
	GetURLByID(id string) (*models.URL, error)
	GetAllURLs() ([]*models.URL, error)
	DeleteURL(id string) error
	RecordClick(id string) error
}

type urlService struct {
	repo repository.URLRepository
}

func NewURLService(repo repository.URLRepository) URLService {
	return &urlService{repo: repo}
}

func (s *urlService) CreateShortURL(originalURL string) (*models.URL, error) {
	existingURL, err := s.repo.FindByOriginalURL(originalURL)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing URL: %w", err)
	}

	if existingURL != nil {
		return existingURL, nil
	}

	shortURL := utils.GenerateShortURL(originalURL)

	url := &models.URL{
		ID:           shortURL,
		OriginalURL:  originalURL,
		ShortURL:     shortURL,
		CreationDate: time.Now(),
		ClickCount:   0,
	}

	err = s.repo.Create(url)
	if err != nil {
		return nil, fmt.Errorf("failed to create short URL: %w", err)
	}

	return url, nil
}

func (s *urlService) GetURLByID(id string) (*models.URL, error) {
	return s.repo.FindByID(id)
}

func (s *urlService) GetAllURLs() ([]*models.URL, error) {
	return s.repo.FindAll()
}

func (s *urlService) DeleteURL(id string) error {
	return s.repo.Delete(id)
}

func (s *urlService) RecordClick(id string) error {
	return s.repo.IncrementClickCount(id)
}