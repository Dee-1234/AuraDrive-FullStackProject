# AuraDrive-FullStackProject
AuraDrive - Ride-Sharing Marketplace. AuraDrive is a full-stack ride-sharing application built with Spring Boot and React. It features a real-time marketplace where riders can request trips and drivers can claim and manage rides.
Features
-Rider Flow: Create ride requests, track status, and view trip history.
-Driver Dashboard: Live marketplace of available rides, one-click "Accept," and active ride management.
-Secure Authentication: JWT-based security with role-based access control (RIDER/DRIVER).
-Real-time Updates: Integrated with WebSockets for instant ride notifications.
-Interactive UI: Clean, modern dashboard built with Tailwind CSS.

🛠️ Tech Stack
Backend (Spring Boot)
-Java 17+
-Spring Security & JWT (Role-based access)
-Spring Data JPA (MySQL/PostgreSQL)
-Lombok & ModelMapper
-Spring WebSocket

Frontend (React)
-Vite
-Tailwind CSS
-Axios (with interceptors for JWT)
-React Router Dom

Database
-PostgreSQL

Project Flow
1. Rider posts a request to the server.
2. Backend saves the ride as REQUESTED and notifies drivers via WebSocket.
3. Driver fetches available rides and clicks Accept.
4. Backend updates status to ACCEPTED and assigns the driver.
