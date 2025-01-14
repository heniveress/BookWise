# Book Recommendation Website

## Project Overview

This project is a web application for a **Book Recommendation Platform**. Developed using the **Express** framework, it focuses on **server-side functionalities** such as **user and session management**, **database interactions**, **and role-based access control**.

## Technologies Used
- **Node.js** (Express framework)
- **EJS** for dynamic views
- **MySQL** for database management
- **HTML** and **CSS** for front-end design
- **JavaScript** for client-side interactions

## Key Features

### User and Session Management
- Implements session management using **Express session**.
- Differentiates between user roles (e.g., Admin, Regular User, and Guest User).
- Secured routes accessible only to logged-in users.

### Role-Based Access
- Admin users can manage book data (add, edit, delete).
- Regular users can view book recommendations and search for books.

### Search Functionality
- Users can search for books by keywords and filters.
- Dinamically displays search results.

### Data Management via Forms (CRUD operations)
- **Create**: Add new book entries.
- **Read**: View detailed book information.
- **Update**: Edit existing book details.
- **Delete**: Remove book records from the database.

## Additional Functionalities
- **File Upload**: Users can upload files (e.g., book cover images) to the server.
- **Client-Side Network Requests**: Uses Fetch API for seamless client-server interactions, such as submitting forms and refreshing page sections.

### Project developed as part of a web technology course (2023).