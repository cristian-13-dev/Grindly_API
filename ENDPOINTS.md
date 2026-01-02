# Grindly API Endpoints

Below is a comprehensive list of available endpoints, the methods allowed for each, and a brief description of their functionality.

### **Auth Endpoints**
*   `POST: /api/v1/auth/sign-up` -> Register a new user account.
*   `POST: /api/v1/auth/sign-in` -> Authenticate a user and receive access/refresh tokens via cookies.
*   `POST: /api/v1/auth/sign-out` -> Clear authentication cookies and log out the user.
*   `POST: /api/v1/auth/refresh` -> Refresh the access token using a valid refresh token.
*   `PUT: /api/v1/auth/change-password` -> Change the current user's password (requires authentication).

### **User Endpoints**
*   `GET: /api/v1/users/` -> Retrieve a list of all users (publicly accessible).
*   `GET: /api/v1/users/me` -> Get the profile details of the currently authenticated user.
*   `GET: /api/v1/users/me/gamification` -> Get gamification stats (XP, level, coins, streaks) for the current user.
*   `PATCH: /api/v1/users/me` -> Update the current user's profile (e.g., username, email).
*   `DELETE: /api/v1/users/me` -> Delete the current user's account.
*   `GET: /api/v1/users/:id` -> Get profile details for a specific user by ID.

### **Task Endpoints**
*   `GET: /api/v1/tasks/` -> Get all tasks belonging to the current user.
*   `POST: /api/v1/tasks/` -> Create a new task.
*   `GET: /api/v1/tasks/stats` -> Get statistics regarding the user's tasks.
*   `GET: /api/v1/tasks/frequency/:frequency` -> Filter tasks by frequency (e.g., daily, weekly).
*   `GET: /api/v1/tasks/:id` -> Get details of a specific task.
*   `PATCH: /api/v1/tasks/:id` -> Update an existing task.
*   `DELETE: /api/v1/tasks/:id` -> Delete a specific task.
*   `PATCH: /api/v1/tasks/:id/complete` -> Mark a specific task as completed.

### **Reward Endpoints**
*   `GET: /api/v1/rewards/` -> Get all rewards.
*   `POST: /api/v1/rewards/` -> Create a new reward.
*   `GET: /api/v1/rewards/available` -> List rewards available for the user to claim.
*   `GET: /api/v1/rewards/claimed` -> List rewards already claimed by the user.
*   `GET: /api/v1/rewards/:id` -> Get details of a specific reward.
*   `PATCH: /api/v1/rewards/:id` -> Update a specific reward.
*   `DELETE: /api/v1/rewards/:id` -> Delete a reward.
*   `PATCH: /api/v1/rewards/:id/claim` -> Claim a reward using earned coins.

### **Event Log Endpoints**
*   `GET: /api/v1/events/` -> Get all event logs for the user.
*   `POST: /api/v1/events/` -> Create a new event log entry.
*   `GET: /api/v1/events/stats` -> Get statistics based on event logs.
*   `GET: /api/v1/events/metric/:metric` -> Filter event logs by a specific metric.

### **General**
*   `GET: /` -> Welcome message and API status check.
