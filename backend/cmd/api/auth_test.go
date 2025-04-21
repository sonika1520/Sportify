package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/MishNia/Sportify.git/internal/auth"
	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGoogleCallbackHandler(t *testing.T) {
	app := newTestApplication()
	router := app.mount()

	// Setup mock for GetGoogleUserInfo
	auth.SetMockGetGoogleUserInfo(func(code string) (*auth.GoogleUserInfo, error) {
		if code == "valid_code" {
			return &auth.GoogleUserInfo{
				ID:    "google123",
				Email: "test@example.com",
				Name:  "Test User",
			}, nil
		}
		return nil, fmt.Errorf("invalid code")
	})
	defer auth.ClearMockGetGoogleUserInfo()

	tests := []struct {
		name           string
		code           string
		setupMock      func(*mockUserStore)
		expectedStatus int
		expectedRedirectContains []string
	}{
		{
			name: "new user",
			code: "valid_code",
			setupMock: func(m *mockUserStore) {
				m.On("CreateOrUpdateGoogleUser", mock.Anything, "google123", "test@example.com", "Test User").
					Return(&store.User{
						ID:        1,
						Email:     "test@example.com",
						Name:      "Test User",
						GoogleID:  "google123",
						CreatedAt: time.Now().Format(time.RFC3339),
						UpdatedAt: time.Now().Format(time.RFC3339),
					}, true, nil)
			},
			expectedStatus: http.StatusTemporaryRedirect,
			expectedRedirectContains: []string{"token=", "isNewUser=true"},
		},
		{
			name: "existing user",
			code: "valid_code",
			setupMock: func(m *mockUserStore) {
				m.On("CreateOrUpdateGoogleUser", mock.Anything, "google123", "test@example.com", "Test User").
					Return(&store.User{
						ID:        1,
						Email:     "test@example.com",
						Name:      "Test User",
						GoogleID:  "google123",
						CreatedAt: time.Now().Format(time.RFC3339),
						UpdatedAt: time.Now().Format(time.RFC3339),
					}, false, nil)
			},
			expectedStatus: http.StatusTemporaryRedirect,
			expectedRedirectContains: []string{"token=", "isNewUser=false"},
		},
		{
			name:           "missing code",
			code:           "",
			setupMock:      func(m *mockUserStore) {},
			expectedStatus: http.StatusBadRequest,
			expectedRedirectContains: nil,
		},
		{
			name:           "invalid code",
			code:           "invalid_code",
			setupMock:      func(m *mockUserStore) {},
			expectedStatus: http.StatusBadRequest,
			expectedRedirectContains: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Reset mock expectations
			mockStore := app.store.Users.(*mockUserStore)
			mockStore.ExpectedCalls = nil
			mockStore.Calls = nil

			// Setup mock expectations
			tt.setupMock(mockStore)

			// Create request
			req := httptest.NewRequest("GET", "/v1/auth/google/callback?code="+tt.code, nil)
			rec := httptest.NewRecorder()

			// Call the handler
			router.ServeHTTP(rec, req)

			// Check status code
			assert.Equal(t, tt.expectedStatus, rec.Code)

			if tt.expectedStatus == http.StatusTemporaryRedirect {
				// Check redirect URL
				location := rec.Header().Get("Location")
				assert.NotEmpty(t, location)
				for _, expected := range tt.expectedRedirectContains {
					assert.Contains(t, location, expected)
				}
			}

			// Verify mock expectations
			mockStore.AssertExpectations(t)
		})
	}
}
