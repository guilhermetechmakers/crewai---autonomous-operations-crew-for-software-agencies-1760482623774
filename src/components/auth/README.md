# OAuth and SSO Authentication

This directory contains the OAuth and Single Sign-On (SSO) authentication components for the CrewAI platform.

## Components

### SSOProviders
The main component that renders OAuth provider buttons (Google, GitHub, Microsoft).

**Features:**
- Dynamic provider loading from AuthService
- Error handling with retry logic
- Loading states and user feedback
- Disabled state support
- Toast notifications for success/error states

**Usage:**
```tsx
<SSOProviders
  onSuccess={() => console.log('OAuth initiated')}
  onError={(error) => console.error('OAuth failed:', error)}
  variant="outline"
  size="default"
  disabled={false}
/>
```

### SSOButton
Individual OAuth provider button component.

**Features:**
- Provider-specific styling and icons
- Loading states with spinner
- Hover and focus effects
- Accessibility support

**Usage:**
```tsx
<SSOButton
  provider="google"
  onClick={() => handleGoogleLogin()}
  loading={false}
  variant="outline"
/>
```

### OAuthTestComponent
Development component for testing OAuth integration.

**Features:**
- Test individual providers
- Test all providers at once
- Real-time status updates
- Error reporting
- Only shows in development mode

## OAuth Flow

1. **Initiation**: User clicks OAuth provider button
2. **Redirect**: User is redirected to provider's OAuth page
3. **Authorization**: User grants permissions to the app
4. **Callback**: Provider redirects back to `/auth/callback`
5. **Token Exchange**: Backend exchanges authorization code for access token
6. **User Creation/Login**: User is created or logged in
7. **Redirect**: User is redirected to dashboard or original page

## Error Handling

The OAuth system includes comprehensive error handling:

- **Network errors**: Retry with exponential backoff
- **Configuration errors**: Clear error messages
- **User cancellation**: Graceful handling
- **Invalid state**: CSRF protection
- **Server errors**: User-friendly messages

## Security Features

- **State parameter validation**: Prevents CSRF attacks
- **Secure token storage**: Tokens stored in localStorage
- **Automatic cleanup**: OAuth state cleared after use
- **Error logging**: Detailed error tracking for debugging

## Environment Variables

Configure OAuth providers using environment variables:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_MICROSOFT_TENANT_ID=common
```

## Testing

Use the OAuthTestComponent in development mode to test OAuth integration:

1. Set up OAuth apps with each provider
2. Configure environment variables
3. Run the app in development mode
4. Use the test component to verify OAuth flows

## Provider Configuration

### Google OAuth
- Scopes: `openid email profile`
- Redirect URI: `{your_domain}/auth/callback`

### GitHub OAuth
- Scopes: `user:email`
- Redirect URI: `{your_domain}/auth/callback`

### Microsoft OAuth
- Scopes: `openid email profile`
- Redirect URI: `{your_domain}/auth/callback`
- Tenant: `common` (or your specific tenant ID)