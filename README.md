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
1. Java 17+
2. Spring Security & JWT (Role-based access)
3. Spring Data JPA (MySQL/PostgreSQL)
4. Lombok & ModelMapper
5. Spring WebSocket

Frontend (React)
1. Vite
2. Tailwind CSS
3. Axios (with interceptors for JWT)
4. React Router Dom

Database
-PostgreSQL

Project Flow
1. Rider posts a request to the server.
2. Backend saves the ride as REQUESTED and notifies drivers via WebSocket.
3. Driver fetches available rides and clicks Accept.
4. Backend updates status to ACCEPTED and assigns the driver.

Screen Shots
https://github.com/Dee-1234/AuraDrive-FullStackProject/tree/main/ScreenShots
