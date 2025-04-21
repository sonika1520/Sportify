package auth

import (
	"context"
	"fmt"
	"golang.org/x/oauth2"
)

// MockGoogleOAuthConfig is a mock implementation of the Google OAuth configuration
type MockGoogleOAuthConfig struct {
	ExchangeFunc func(ctx context.Context, code string) (*oauth2.Token, error)
}

// Exchange is a mock implementation of the token exchange
func (m *MockGoogleOAuthConfig) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	if m.ExchangeFunc != nil {
		return m.ExchangeFunc(ctx, code)
	}
	return nil, fmt.Errorf("exchange function not implemented")
}

// mockGetGoogleUserInfo is a variable that can be set to override the GetGoogleUserInfo behavior
var mockGetGoogleUserInfo func(code string) (*GoogleUserInfo, error)

// SetMockGetGoogleUserInfo sets the mock implementation for GetGoogleUserInfo
func SetMockGetGoogleUserInfo(mock func(code string) (*GoogleUserInfo, error)) {
	mockGetGoogleUserInfo = mock
}

// ClearMockGetGoogleUserInfo clears the mock implementation
func ClearMockGetGoogleUserInfo() {
	mockGetGoogleUserInfo = nil
} 