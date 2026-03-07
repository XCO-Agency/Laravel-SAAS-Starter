# API Usage Dashboard

## Overview
The API Usage Dashboard provides workspace owners and admins with comprehensive analytics about their API key usage, request volumes, response times, and error rates.

## Features

### Overview Statistics
- **Total Requests**: Count of all API requests within the selected period
- **Average Response Time**: Mean response time in milliseconds across all endpoints
- **Throttled Requests**: Number of rate-limited (429) responses
- **Error Rate**: Percentage of 4xx and 5xx responses

### Request Volume Chart
- Daily breakdown of API requests over the selected period
- Visual bar chart showing total requests, errors highlighted in red
- Configurable time periods: 7, 14, 30, or 90 days

### Per-Key Usage
- Request count per API key
- Throttled request count per key
- Average response time per key
- Last request timestamp per key

### Status Code Distribution
- Grouped breakdown: 2xx, 3xx, 4xx, 5xx
- Percentage and count for each group
- Visual progress bars

### Top Endpoints
- Most frequently requested API endpoints
- HTTP method badges (GET, POST, PUT, DELETE)
- Average response time per endpoint
- Error count per endpoint

## Architecture

### Request Logging
API requests are automatically logged by the `AuthenticateApiKey` middleware. Each successful authentication creates an `ApiRequestLog` entry capturing:
- Workspace and API key association
- HTTP method and path
- Response status code
- Response time in milliseconds
- Whether the request was throttled (429)
- Client IP address
- Request timestamp

Failed authentication attempts (invalid key, expired key, insufficient scope) are **not** logged.

### Database Schema
The `api_request_logs` table stores individual request records with indexes optimized for:
- Per-workspace queries by date range
- Per-key queries by date range
- Global time-based queries

### Access Control
- Requires workspace `update` gate authorization
- Available to workspace owners and admins
- Regular members are denied access (403)

## Routes
| Method | URI | Description |
|--------|-----|-------------|
| GET | `/workspaces/api-usage` | API usage dashboard |
| GET | `/workspaces/api-usage?period=7` | With period filter |

### Query Parameters
- `period`: Time range filter — `7`, `14`, `30` (default), `90` days

## Navigation
The API Usage page appears in the workspace settings sidebar under "API Usage" with an Activity icon, placed after the Analytics entry.

## Test Coverage
- 18 tests, 211 assertions
- Page rendering and access control
- Overview statistics accuracy
- Period filtering (7/14/30/90 days)
- Per-key usage breakdown
- Status code distribution
- Top endpoints ranking
- Daily volume aggregation
- Workspace isolation
- Empty state handling
- Throttled request tracking
- Middleware request logging
- Admin access
- Average response time calculation
