# AIBTS Project Report

## AI-Based Integrated Bus Tracking System

### Submitted By
- Piyush Mishra

### Project Type
- Full Stack Web Application

### Technology Stack
- Next.js
- React
- TypeScript
- Tailwind CSS
- MySQL

### Academic Session
- 2025-2026

---

## Certificate / Declaration

This project report titled **AI-Based Integrated Bus Tracking System (AIBTS)** presents the design, development, and implementation of a web-based bus management and tracking platform. The system has been developed to improve passenger convenience, driver trip management, and administrative control in a single integrated application. The work described in this report is based on the actual implementation of the project, including authentication, route management, bus management, trip assignment, ticket booking, and live trip tracking.

This report is prepared for academic and demonstration purposes and reflects the architecture, modules, database design, implementation process, and future scope of the system.

---

## Acknowledgement

I would like to express my sincere gratitude to everyone who supported the completion of this project. This report and the corresponding software system were completed with guidance, consistent learning, and practical experimentation in full stack development.

I am thankful to my teachers and mentors for providing the technical foundation required to understand software engineering concepts such as database integration, user authentication, frontend design, API development, and deployment planning. Their guidance helped shape this project in a structured and professional way.

I also acknowledge the value of modern development tools and frameworks such as Next.js, React, TypeScript, Tailwind CSS, and MySQL, which made it possible to build a scalable and modular application. This project gave me practical exposure to solving real-world issues such as route data management, role-based access control, persistent booking storage, and live status tracking.

Finally, I thank my family and peers for their encouragement throughout the development of this project.

---

## Abstract

Transportation management remains a major challenge in both public and private bus systems. Passengers often face uncertainty regarding bus schedules, trip availability, boarding locations, estimated arrival times, and booking records. At the same time, drivers and administrators require a structured platform to manage trips, routes, buses, and passenger bookings effectively. To address these issues, the **AI-Based Integrated Bus Tracking System (AIBTS)** has been developed as a full stack web application.

The AIBTS project provides a unified platform for three categories of users: **Passengers**, **Drivers**, and **Administrators**. Passengers can search buses, check trip details, select boarding and dropping points, choose seats, confirm bookings, and view live trip tracking information. Drivers can log in to view assigned trips and trip details. Administrators can manage buses, routes, drivers, bookings, reports, and trip assignments from a centralized dashboard.

The application is built using **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **MySQL**. Authentication is based on role-specific sign-up and sign-in, and the backend uses API routes for interaction with the database. The system includes database-backed tables for users, sessions, buses, routes, trips, and bookings. The platform also provides a route-based tracking experience inspired by railway live-status systems, allowing passengers to monitor current bus progress and estimated arrival data.

This project demonstrates how a digital system can improve operational efficiency, reduce manual work, and enhance transparency in bus transportation services.

---

## 1. Introduction

Public transportation is one of the most essential services in modern society. Bus transportation, in particular, serves millions of people daily for local, regional, and interstate travel. Despite its importance, many transport systems still rely on fragmented processes for route management, ticket booking, and passenger communication. In many cases, passengers do not receive clear information about available buses, current trip positions, or accurate boarding and dropping points. Administrators often manage buses and drivers manually, which increases inefficiency and the possibility of errors.

The **AI-Based Integrated Bus Tracking System (AIBTS)** is designed to bridge this gap by introducing a centralized digital platform. The main idea is to combine scheduling, bus route management, booking management, live trip visibility, and role-based access into one web application. The project supports both **government roadways buses** and **private buses**, making it practical for mixed transportation networks.

This system is especially useful in scenarios where passengers need a convenient online method to:
- search buses between two locations,
- compare available routes,
- book seats,
- choose boarding and dropping points,
- track their trip,
- and revisit their booking history.

At the same time, drivers need a dashboard that shows assigned trips clearly, and administrators need reliable control over system data. The project therefore focuses on usability, modular design, and persistent storage of important operational records.

---

## 2. Problem Statement

Traditional or semi-digital bus transport systems face several limitations:

- Passengers often lack a unified platform for discovering available buses.
- Bus tracking information is not always available in real time.
- Ticket bookings may be inconsistent or not persist properly.
- Driver trip assignments are difficult to manage without a dedicated system.
- Bus, route, and schedule management is often handled through disconnected spreadsheets or manual records.
- Public and private bus data are rarely integrated into a common experience.
- Passengers may not know valid boarding and dropping points clearly.
- Administrative reporting and operational visibility are limited.

These problems create inconvenience for passengers and operational inefficiency for transport administrators. A digital solution is therefore needed to manage transportation workflows in a structured, user-friendly, and scalable way.

---

## 3. Objectives of the Project

The key objectives of the AIBTS project are:

- To build a unified bus management and tracking platform.
- To support three user roles: Passenger, Driver, and Admin.
- To provide secure sign-up and sign-in functionality for each role.
- To store user, bus, route, trip, and booking data in MySQL.
- To allow passengers to search buses and book tickets online.
- To support both government roadways buses and private buses.
- To provide boarding and dropping point selection based on route stops.
- To allow administrators to create and manage routes, buses, and trips.
- To allow trip assignment to specific drivers.
- To preserve booking records even after logout.
- To provide live route-style trip tracking with trip progress and estimated timings.
- To prepare the system for future deployment on platforms such as Netlify with cloud database support.

---

## 4. Scope of the Project

The current scope of this project includes:

- Role-based web authentication
- Passenger dashboard and trip search
- Bus listing with roadways and private operators
- Boarding and dropping point support
- Seat selection and ticket booking
- Persistent booking storage in MySQL
- Driver dashboard and assigned trip view
- Admin management modules for buses, routes, trips, drivers, bookings, and reports
- Live trip tracking interface
- Basic analytics and report visualizations

The current system is intended as a robust prototype and academic project. It demonstrates the full workflow of a digital bus platform, though future versions can extend it with payment gateways, GPS hardware integration, push notifications, PDF ticket generation, and cloud deployment automation.

---

## 5. Existing System and Limitations

In many traditional transportation systems, data is either managed manually or split across different disconnected tools. Passengers typically rely on counters, paper tickets, or multiple uncoordinated apps. In small and medium transport operations:

- route data may exist only in printed schedules,
- driver assignments may be stored informally,
- live tracking may not be available,
- bookings may not be centralized,
- and administrators may not have any dashboard for reports or operational review.

Even in digital systems, users may experience the following:

- limited route visibility,
- poor seat selection experience,
- no persistent booking history,
- weak role separation,
- no clear support for both public and private buses,
- and no proper reporting module.

The proposed AIBTS system improves these limitations by consolidating all major functions in one application.

---

## 6. Proposed System

The proposed system is a web-based bus management platform that provides:

- a single entry point for all user roles,
- database-backed data persistence,
- trip search and online ticket booking,
- driver trip visibility,
- and admin-level operational control.

The platform is divided into the following major modules:

### 6.1 Passenger Module
- Sign up and sign in
- Search buses by source and destination
- Filter by operator type and bus type
- View route and fare details
- Select boarding and dropping points
- Select seats
- Confirm booking
- View booking history
- Track active trips

### 6.2 Driver Module
- Sign in as driver
- View assigned trips
- View trip details and route information
- Monitor personal trip schedule

### 6.3 Admin Module
- Manage buses
- Manage routes
- Add and manage drivers
- Create and assign trips
- View all bookings
- View reports and summary data

### 6.4 Tracking Module
- Display route progress visually
- Show current stop and next stop
- Estimate upcoming arrival and destination arrival
- Show trip status such as scheduled, in-progress, and completed

---

## 7. Technologies Used

The project uses a modern full stack JavaScript and TypeScript ecosystem.

### 7.1 Frontend
- **React** for building reusable UI components
- **Next.js** for routing, rendering, and application structure
- **TypeScript** for type safety and maintainable code
- **Tailwind CSS** for responsive styling
- **Radix UI components** for accessible interface elements
- **Lucide React** for icons
- **Recharts** for reports and charts
- **Leaflet / React Leaflet** for location and map-related visualization

### 7.2 Backend
- **Next.js API routes** for server-side endpoints
- **Node.js runtime** used by the Next.js server
- **MySQL** for persistent relational data storage
- **mysql2** package for database communication

### 7.3 Development Tools
- VS Code
- pnpm package manager
- PowerShell terminal
- Git/GitHub for version control

---

## 8. System Architecture

The system follows a layered architecture:

### 8.1 Presentation Layer
This includes all frontend pages and reusable UI components. Pages are organized by user role:
- passenger pages,
- driver pages,
- admin pages,
- and shared landing/authentication pages.

### 8.2 Application Logic Layer
This includes:
- booking context for frontend state handling,
- authentication context,
- route filtering logic,
- fare calculation logic,
- seat availability logic,
- and live tracking computation.

### 8.3 API Layer
This layer provides endpoints such as:
- `/api/auth/signin`
- `/api/auth/signup`
- `/api/auth/me`
- `/api/auth/logout`
- `/api/buses`
- `/api/drivers`
- `/api/routes`
- `/api/trips`
- `/api/bookings`

### 8.4 Data Layer
The data layer is implemented with MySQL and includes persistent storage for:
- users,
- sessions,
- buses,
- routes,
- trips,
- bookings.

---

## 9. Database Design

The database name used for the project is **aibts**. The schema supports all major business entities.

### 9.1 Users Table
Stores login and role information for passengers, drivers, and admins.

Fields:
- id
- name
- email
- phone
- password_hash
- role
- created_at
- updated_at

### 9.2 Sessions Table
Stores active login sessions.

Fields:
- id
- token
- user_id
- expires_at
- created_at

### 9.3 Buses Table
Stores bus information for both roadways and private operators.

Fields:
- id
- operator_id
- registration_number
- model
- bus_type
- capacity
- amenities
- status
- current_location_lat
- current_location_lng

### 9.4 Routes Table
Stores route details and intermediate stops.

Fields:
- id
- operator_id
- name
- origin_name
- origin_lat
- origin_lng
- destination_name
- destination_lat
- destination_lng
- stops
- distance
- estimated_duration
- base_fare

### 9.5 Trips Table
Stores actual scheduled trips.

Fields:
- id
- route_id
- bus_id
- driver_id
- departure_time
- arrival_time
- status
- current_stop_index
- current_location_lat
- current_location_lng
- passengers

### 9.6 Bookings Table
Stores passenger ticket bookings and persists them after logout.

Fields:
- id
- passenger_id
- trip_id
- seat_numbers
- status
- total_fare
- booked_at
- boarding_stop
- dropping_stop
- passenger_name
- passenger_phone

---

## 10. Module Implementation

### 10.1 Authentication Module

The authentication module supports separate sign-up and sign-in for:
- Passenger
- Driver
- Admin

Passwords are hashed before storage, and session-based authentication is used to preserve logged-in state securely. Role checks are applied to route access so that users are redirected to the correct dashboard.

### 10.2 Passenger Search Module

Passengers can search buses using source and destination. Search logic supports:
- direct route matches,
- stop-based matching,
- operator type filtering,
- and bus type filtering.

This makes the platform more flexible than simple endpoint-only searches.

### 10.3 Booking Module

The booking module allows a passenger to:
- open a specific trip,
- choose valid boarding and dropping points,
- select seats,
- confirm the booking,
- and later revisit the ticket in the bookings page.

Originally, bookings were stored only in frontend state, which caused tickets to disappear after logout. This was corrected by moving booking creation and cancellation into MySQL-backed API routes.

### 10.4 Driver Module

Drivers can sign in to a dedicated dashboard and view:
- current trips,
- upcoming trips,
- trip summaries,
- and trip details.

Trips are assigned by the admin through the trip creation interface. Driver pages show only the trips whose `driverId` matches the logged-in driver account.

### 10.5 Bus Management Module

Administrators can manage buses, including:
- operator,
- registration number,
- bus type,
- capacity,
- amenities,
- status.

This module supports both government and private operators, which is an important project feature.

### 10.6 Route Management Module

Administrators can now add routes from the UI. Route creation includes:
- operator selection,
- route name,
- origin and destination,
- distance,
- estimated duration,
- base fare,
- intermediate stops.

Route data is stored in MySQL and made available immediately to trip assignment and passenger search workflows.

### 10.7 Trip Management Module

Administrators can create trips by selecting:
- route,
- bus,
- driver,
- departure time,
- arrival time,
- status.

The system calculates and stores trip records so that drivers and passengers interact with the same source of truth.

### 10.8 Reports Module

The reports dashboard provides:
- booking summary,
- revenue summary,
- route performance,
- booking status distribution,
- recent trip activity.

This helps administrators observe operational status without directly querying the database.

### 10.9 Live Tracking Module

The live tracking module simulates a “Where is my train”-style experience. It calculates:
- current stop,
- next stop,
- estimated arrival,
- destination ETA,
- completion percentage,
- running status.

This gives passengers a more transparent trip experience.

---

## 11. User Interface Design

The interface is designed to be:
- role-based,
- responsive,
- clear,
- and easy to navigate.

### Passenger UI
Passenger pages focus on ease of booking. Large cards, fare visibility, route details, and seat selection improve usability.

### Driver UI
Driver pages focus on operational clarity. The dashboard highlights trip count, passenger load, and schedule information.

### Admin UI
Admin pages are dashboard-driven and data-centric. Tables, dialogs, filters, and summary cards provide a management-oriented experience.

The design uses consistent styling with Tailwind CSS and a component system for maintainability.

---

## 12. Testing and Debugging

During project development, several practical issues were identified and resolved:

- Missing admin pages causing `404` errors
- Driver add option being disabled and not connected to the database
- Route add option not saving correctly
- Fares displaying as `₹NaN` due to using `fare` instead of `baseFare`
- Leaflet icon initialization causing map runtime errors
- Routes returning empty stop lists due to server-side parsing issues
- Bookings disappearing after logout because they were only stored in client state
- Date confusion in assigned driver trips because trips were scheduled for a future day rather than the current date

The system was repeatedly validated through:
- direct page testing,
- API response verification,
- and production builds using `pnpm build`.

This debugging process significantly improved the reliability of the final application.

---

## 13. Advantages of the System

The developed project offers several benefits:

- Centralized bus transport management
- Support for multiple user roles
- Better passenger convenience
- Reduced dependency on manual processes
- Persistent storage of critical records
- Integrated route, bus, trip, and booking flow
- Support for both public and private operators
- Admin-level reporting and analytics
- Expandable architecture for future real-time features

---

## 14. Limitations of the Current Version

Although the project is functionally strong, some limitations remain:

- GPS tracking is simulated and not connected to real hardware
- Online payment gateway is not yet integrated
- PDF ticket download is not yet implemented
- Notifications via SMS/email are not yet available
- Route editing and deletion are limited compared to creation support
- Some data validation can still be improved for user-entered route coordinates and timings
- Netlify deployment requires migration from local MySQL to cloud MySQL

These limitations are natural for a project prototype and provide useful opportunities for future enhancement.

---

## 15. Future Scope

The project has strong future expansion potential. Possible improvements include:

- Real GPS integration for live bus location
- Online payment integration using Razorpay or Stripe
- QR-code based digital ticketing
- SMS and email notifications for booking confirmation
- ETA prediction using traffic-aware or AI-based models
- Admin export to PDF/Excel
- Route editing, deletion, and stop reordering
- Mobile app version
- Cloud deployment with CI/CD pipeline
- Passenger reviews and ratings for private operators
- Seat layout customization by bus model

With these additions, the project can evolve into a production-ready smart transportation system.

---

## 16. Conclusion

The **AI-Based Integrated Bus Tracking System (AIBTS)** successfully demonstrates how modern full stack technologies can be used to solve practical transportation management problems. The project brings together passenger services, driver operations, and administrative control in one coherent web application. It supports role-based authentication, route and bus management, trip assignment, seat booking, booking persistence, and live tracking.

A major strength of the project is that it does not remain a static demonstration. It includes a real database-backed architecture with MySQL, modern UI design with Next.js and React, and separate operational workflows for all major stakeholders in a bus transport system. The application now stores important records such as drivers, buses, routes, trips, and bookings persistently, making it much more realistic and useful.

This project helped apply theoretical concepts such as database design, API development, state management, authentication, and UI engineering in a practical context. It also provided experience in debugging real integration issues and incrementally improving a system until its core modules worked together reliably.

In conclusion, AIBTS is a meaningful academic and technical project that addresses real-world transportation challenges and provides a strong foundation for future development into a complete smart mobility platform.

---

## 17. References

- Next.js Documentation
- React Documentation
- TypeScript Documentation
- MySQL Documentation
- Tailwind CSS Documentation
- Recharts Documentation
- Leaflet Documentation
- Software engineering and database management course materials

---

## Appendix A: Main Features Implemented

- Multi-role authentication
- Passenger search page
- Passenger booking page
- Persistent bookings
- Driver dashboard
- Driver trip details
- Admin bus management
- Admin route management
- Admin trip assignment
- Admin driver management
- Admin bookings page
- Admin reports page
- Live trip tracking

---

## Appendix B: Suggested Report Formatting for 15 Pages

To make this report reach approximately 15 pages in MS Word or Google Docs, use:

- Font: Times New Roman
- Font Size: 12
- Line Spacing: 1.5
- Margins: Normal
- Heading Style: Bold, 14 to 16 pt
- Include a cover page
- Add page numbers
- Add screenshots of:
  - Landing page
  - Passenger search page
  - Booking page
  - Driver dashboard
  - Admin buses page
  - Admin routes page
  - Admin trips page
  - Reports page

If screenshots are added, this report will comfortably expand beyond 15 pages in final submission format.
