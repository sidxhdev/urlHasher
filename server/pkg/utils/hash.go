package utils

import (
	"crypto/md5"
	"encoding/hex"
)

func GenerateShortURL(originalURL string) string {
	hasher := md5.New()
	hasher.Write([]byte(originalURL))
	data := hasher.Sum(nil)
	hash := hex.EncodeToString(data)
	return hash[:10]
}