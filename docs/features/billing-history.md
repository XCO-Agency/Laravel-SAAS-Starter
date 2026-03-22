# Billing History Feature

## Overview

The Billing History feature provides users with a comprehensive view of all their past invoices, with powerful filtering and search capabilities to easily find specific transactions.

## Features

### Invoice List View
- **Clean List Layout**: Easy-to-scan list of all invoices
- **Invoice Details**: Shows date, invoice number, and amount for each transaction
- **Quick Actions**: One-click PDF download for each invoice
- **Empty State**: Helpful message when no invoices exist

### Date Filtering
Filter invoices by time period:
- **All Time**: Show complete invoice history
- **30 Days**: Last month's invoices
- **90 Days**: Last quarter's invoices  
- **1 Year**: Last year's invoices

### Search Functionality
Search through invoices by:
- Invoice date (e.g., "March 2024")
- Amount (e.g., "29.00")
- Invoice ID (e.g., "inv_123")

### Statistics Dashboard
Three summary cards showing:
- **Total Invoices**: Count of all invoices ever received
- **Filtered Amount**: Sum of currently visible invoices
- **Last Invoice**: Date of most recent invoice

## User Interface

### Accessing Billing History
1. Navigate to **Billing** from the sidebar
2. Click **"View History"** button in the Current Plan card
3. Or navigate directly to `/billing/history`

### Using Filters
1. **Date Filter**: Click one of the period buttons (All Time, 30 Days, 90 Days, 1 Year)
2. **Search**: Type in the search box to filter by date, amount, or ID
3. **Clear Filters**: Click "Clear filters" to reset all filters

### Downloading Invoices
1. Find the desired invoice in the list
2. Click the **"PDF"** button next to the invoice
3. The PDF will download to your device

## Technical Implementation

### Backend

**Route**: `GET /billing/history`

**Controller**: `BillingController@history`

**Data Provided**:
```php
[
    'invoices' => [
        [
            'id' => 'inv_123',
            'date' => 'March 15, 2024',
            'total' => 2900, // in cents
            'pdf_url' => '/billing/invoices/inv_123',
        ],
        // ...
    ]
]
```

### Frontend

**Component**: `resources/js/pages/billing/history.tsx`

**Key Features**:
- Client-side filtering for instant results
- Responsive design (works on mobile and desktop)
- Real-time search with debouncing
- Stats calculation based on filtered results

## Testing

Run the feature tests:
```bash
php artisan test tests/Feature/Billing/BillingHistoryTest.php
```

**Test Coverage**:
- Page display for all user roles
- Invoice data format validation
- Empty state handling
- Authentication requirements

## Future Enhancements

Potential improvements:
- [ ] Export invoice list as CSV
- [ ] Advanced filters (amount range, plan type)
- [ ] Sort by amount or date
- [ ] Invoice preview without download
- [ ] Bulk PDF download
- [ ] Email invoice resend functionality

## Related Features

- [Billing Management](./billing.md)
- [Plan Comparison](./plan-comparison.md)
- [Subscription Management](./subscription-management.md)
