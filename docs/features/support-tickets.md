# Global Support Ticket System

## Overview

The Global Support Ticket System provides a centralized way for users to request help or report issues directly to the platform administrators. It includes a user-facing portal to create and manage tickets, and a dedicated admin portal to review, prioritize, and respond to them.

## Key Features

### For Users

- **Create Tickets:** Users can open new support tickets, providing a subject, detailed description, and a priority level (low, normal, high, urgent).
- **View Tickets:** Users have a dedicated page in their account settings to view their ticket history, current status, and admin replies.
- **Reply:** Users can respond to admin replies, which automatically reopens closed or resolved tickets.

### For Administrators

- **Global Ticket Dashboard:** Admins have a global view of all support tickets submitted across the platform.
- **Filtering & Search:** Admins can filter tickets by status and search by subject to find specific issues quickly.
- **Manage Status & Priority:** Admins can organize workflow by updating ticket statuses ('open', 'in_progress', 'resolved', 'closed') and adjusting priorities as needed.
- **Reply to Users:** Admins can send replies back to the user right from the admin dashboard, keeping communication centralized. When an admin replies to an 'open' ticket, it automatically transitions to 'in_progress'.

## Architecture

The ticket system is built on the `Ticket` and `TicketReply` Eloquent models.

- **Ticket:** Stores the main issue, status, priority, and links to the reporting `User` and their current `Workspace`.
- **TicketReply:** Stores all communication back and forth on a ticket, keeping track of whether a reply originated from the user or an admin (`is_from_admin` boolean).

## Routes

### User Routes (Protected by `auth` middleware)

| Method   | URI                                     | Action         |
|----------|-----------------------------------------|----------------|
| `GET`    | `/settings/tickets`                     | List tickets   |
| `GET`    | `/settings/tickets/{ticket}`            | View ticket    |
| `POST`   | `/settings/tickets`                     | Submit ticket  |
| `POST`   | `/settings/tickets/{ticket}/replies`    | Reply to ticket|

### Admin Routes (Protected by `auth` and `superadmin` middleware)

| Method   | URI                                     | Action              |
|----------|-----------------------------------------|---------------------|
| `GET`    | `/admin/tickets`                        | Global ticket list  |
| `GET`    | `/admin/tickets/{ticket}`               | View full ticket    |
| `PATCH`  | `/admin/tickets/{ticket}`               | Update status/priority |
| `POST`   | `/admin/tickets/{ticket}/replies`       | Admin reply to user |

## Tests

Run `php artisan test --compact tests/Feature/SupportTicketsTest.php` to execute the feature tests covering user ticket creation, viewing, replying, along with the admin portal access, filtering, updating, and replying functionalities.
