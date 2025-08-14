# Discogs API Setup Guide

A comprehensive guide for setting up the Discogs API integration for vinyl collection projects.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started with Discogs API](#getting-started-with-discogs-api)
- [Authentication Methods](#authentication-methods)
- [Environment Configuration](#environment-configuration)
- [Basic Implementation](#basic-implementation)
- [API Endpoints Reference](#api-endpoints-reference)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Best Practices](#best-practices)

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn package manager
- Discogs account
- Basic understanding of REST APIs

## Getting Started with Discogs API

### 1. Create a Discogs Account

1. Go to [Discogs.com](https://www.discogs.com)
2. Sign up for a free account if you don't have one
3. Verify your email address

### 2. Register Your Application

1. Navigate to [Discogs Developer Settings](https://www.discogs.com/settings/developers)
2. Click "Create an App"
3. Fill in the application details:
   - **App Name**: Your vinyl collection app name
   - **Description**: Brief description of your application
   - **Website**: Your application URL (can be localhost for development)
   - **Callback URL**: Required for OAuth (e.g., `http://localhost:3000/auth/callback`)

### 3. Get Your API Credentials

After creating your app, you'll receive:

- **Consumer Key**: Your app's public identifier
- **Consumer Secret**: Your app's private key (keep this secure!)

## Authentication Methods

Discogs API supports multiple authentication methods:

### Option 1: Personal Access Token (Recommended for Development)

1. Go to [Personal Access Tokens](https://www.discogs.com/settings/developers)
2. Click "Generate new token"
3. Provide a token name (e.g., "Vinyl Collection App")
4. Copy the generated token (you won't see it again!)

**Pros**: Simple setup, no OAuth flow needed
**Cons**: Limited to your own account, tokens don't expire but can be revoked

### Option 2: OAuth 1.0a (Recommended for Production)

More complex but allows users to authenticate with their own Discogs accounts.

**Pros**: Users can access their own data, more secure
**Cons**: Requires OAuth implementation

## Environment Configuration

Create a `.env` file in your project root:

```env
# Discogs API Configuration
DISCOGS_CONSUMER_KEY=your_consumer_key_here
DISCOGS_CONSUMER_SECRET=your_consumer_secret_here
DISCOGS_PERSONAL_ACCESS_TOKEN=your_personal_access_token_here

# API Settings
DISCOGS_API_BASE_URL=https://api.discogs.com
DISCOGS_USER_AGENT=YourAppName/1.0 +http://yourwebsite.com

# Rate Limiting
DISCOGS_RATE_LIMIT_PER_MINUTE=60
DISCOGS_RATE_LIMIT_AUTHENTICATED=60
```

Create a `.env.example` file for documentation:

```env
# Copy this file to .env and fill in your actual values

# Discogs API Configuration
DISCOGS_CONSUMER_KEY=your_consumer_key_here
DISCOGS_CONSUMER_SECRET=your_consumer_secret_here
DISCOGS_PERSONAL_ACCESS_TOKEN=your_personal_access_token_here

# API Settings
DISCOGS_API_BASE_URL=https://api.discogs.com
DISCOGS_USER_AGENT=YourAppName/1.0 +http://yourwebsite.com

# Rate Limiting
DISCOGS_RATE_LIMIT_PER_MINUTE=60
DISCOGS_RATE_LIMIT_AUTHENTICATED=60
```

## Basic Implementation

### Install Dependencies

```bash
npm install axios dotenv
# or
yarn add axios dotenv
```

### Basic Service Setup

Create `src/services/discogsService.js`:

```javascript
const axios = require('axios')
require('dotenv').config()

class DiscogsService {
  constructor() {
    this.baseURL = process.env.DISCOGS_API_BASE_URL || 'https://api.discogs.com'
    this.userAgent = process.env.DISCOGS_USER_AGENT || 'VinylCollection/1.0'
    this.token = process.env.DISCOGS_PERSONAL_ACCESS_TOKEN

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'User-Agent': this.userAgent,
        Authorization: `Discogs token=${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    // Rate limiting setup
    this.lastRequestTime = 0
    this.minRequestInterval = 1000 // 1 second between requests
  }

  async makeRequest(endpoint, params = {}) {
    // Simple rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      )
    }

    try {
      const response = await this.client.get(endpoint, { params })
      this.lastRequestTime = Date.now()
      return response.data
    } catch (error) {
      console.error('Discogs API Error:', error.response?.data || error.message)
      throw error
    }
  }

  // Search for releases
  async searchReleases(query, options = {}) {
    const params = {
      q: query,
      type: 'release',
      ...options,
    }
    return this.makeRequest('/database/search', params)
  }

  // Get release details
  async getRelease(releaseId) {
    return this.makeRequest(`/releases/${releaseId}`)
  }

  // Get artist details
  async getArtist(artistId) {
    return this.makeRequest(`/artists/${artistId}`)
  }

  // Get master release details
  async getMasterRelease(masterId) {
    return this.makeRequest(`/masters/${masterId}`)
  }

  // Get user's collection
  async getUserCollection(username, options = {}) {
    const params = {
      sort: 'added',
      sort_order: 'desc',
      ...options,
    }
    return this.makeRequest(`/users/${username}/collection/folders/0/releases`, params)
  }

  // Get user profile
  async getUserProfile(username) {
    return this.makeRequest(`/users/${username}`)
  }
}

module.exports = DiscogsService
```

### Usage Example

```javascript
const DiscogsService = require('./services/discogsService')

async function example() {
  const discogs = new DiscogsService()

  try {
    // Search for releases
    const searchResults = await discogs.searchReleases('Blue Note Miles Davis')
    console.log('Search Results:', searchResults.results.slice(0, 5))

    // Get specific release details
    if (searchResults.results.length > 0) {
      const releaseId = searchResults.results[0].id
      const release = await discogs.getRelease(releaseId)
      console.log('Release Details:', release)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

example()
```

## API Endpoints Reference

### Core Endpoints

- **Database Search**: `/database/search`
- **Release Details**: `/releases/{release_id}`
- **Master Release**: `/masters/{master_id}`
- **Artist Details**: `/artists/{artist_id}`
- **Label Details**: `/labels/{label_id}`

### User Endpoints

- **User Profile**: `/users/{username}`
- **User Collection**: `/users/{username}/collection/folders/0/releases`
- **User Wantlist**: `/users/{username}/wants`

### Marketplace Endpoints

- **Marketplace Listings**: `/marketplace/listings/{listing_id}`
- **Price Suggestions**: `/marketplace/price_suggestions/{release_id}`

## Rate Limiting

Discogs API has the following rate limits:

- **Authenticated requests**: 60 requests per minute
- **Unauthenticated requests**: 25 requests per minute

### Best Practices:

1. Always authenticate your requests
2. Implement request queuing
3. Add delays between requests
4. Monitor rate limit headers in responses
5. Implement exponential backoff for retries

## Error Handling

Common HTTP status codes:

- **200**: Success
- **401**: Unauthorized (invalid token)
- **403**: Forbidden (rate limit exceeded)
- **404**: Not found
- **422**: Unprocessable entity (invalid parameters)
- **500**: Internal server error

Example error handling:

```javascript
async makeRequest(endpoint, params = {}) {
  try {
    const response = await this.client.get(endpoint, { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          throw new Error('Invalid API token');
        case 403:
          throw new Error('Rate limit exceeded');
        case 404:
          throw new Error('Resource not found');
        case 422:
          throw new Error(`Invalid parameters: ${data.message}`);
        default:
          throw new Error(`API Error: ${status} - ${data.message}`);
      }
    }
    throw error;
  }
}
```

## Testing

Create test files to verify your API integration:

```javascript
// tests/discogs.test.js
const DiscogsService = require('../src/services/discogsService')

describe('Discogs API Integration', () => {
  let discogs

  beforeEach(() => {
    discogs = new DiscogsService()
  })

  test('should search for releases', async () => {
    const results = await discogs.searchReleases('Miles Davis Kind of Blue')
    expect(results.results).toBeDefined()
    expect(results.results.length).toBeGreaterThan(0)
  })

  test('should get release details', async () => {
    // Test with a known release ID
    const release = await discogs.getRelease(1)
    expect(release.id).toBe(1)
    expect(release.title).toBeDefined()
  })
})
```

## Best Practices

### 1. Security

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate tokens periodically
- Use HTTPS only

### 2. Performance

- Implement caching for frequently accessed data
- Use batch requests when possible
- Implement proper rate limiting
- Store and reuse data when appropriate

### 3. User Experience

- Show loading states during API calls
- Implement proper error messages
- Provide offline fallbacks when possible
- Cache search results temporarily

### 4. Code Organization

- Separate API logic from business logic
- Use proper error handling
- Write tests for API integrations
- Document your API usage

### 5. Data Management

- Validate API responses
- Handle missing or null data gracefully
- Implement data transformation layers
- Consider data persistence strategies

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your API token
   - Verify token hasn't been revoked
   - Ensure proper Authorization header format

2. **403 Rate Limit Exceeded**
   - Implement proper rate limiting
   - Add delays between requests
   - Use authenticated requests for higher limits

3. **Network Timeouts**
   - Increase timeout values
   - Implement retry logic
   - Check network connectivity

4. **Invalid Responses**
   - Validate response structure
   - Handle edge cases
   - Check API documentation for changes

### Debug Mode

Add debug logging to your service:

```javascript
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Request:', endpoint, params)
  console.log('Response:', response.data)
}
```

## Additional Resources

- [Discogs API Documentation](https://www.discogs.com/developers/)
- [Discogs API Authentication Guide](https://www.discogs.com/developers/#page:authentication)
- [Rate Limiting Guidelines](https://www.discogs.com/developers/#page:home,header:home-rate-limiting)
- [API Status Page](https://status.discogs.com/)

## Support

For issues with the Discogs API:

- Check the [Discogs API Documentation](https://www.discogs.com/developers/)
- Visit the [Discogs API Forum](https://www.discogs.com/forum/thread/743495)
- Contact Discogs support through their website

---

_This guide was created for vinyl collection projects. Update the examples and configurations based on your specific use case._
