# Ticket Management System

A comprehensive ticket management system built with Nuxt 3, Node.js, and MySQL/MariaDB featuring real-time notifications, email alerts, and a modern UI.

## Features

- **Ticket Management**: Create, view, update, and delete support tickets
- **User Management**: Role-based access control (admin, manager, agent, user)
- **Department & Category Organization**: Organize tickets by department and category
- **Real-time Updates**: Instant notifications via Socket.IO when tickets change
- **Email Notifications**: Automated emails for ticket assignments and updates
- **Dashboard**: Visualize ticket statistics and analytics
- **Mobile Responsive**: Modern UI that works across devices
- **History Tracking**: Complete audit trail of all ticket changes

## Tech Stack

### Backend
- **Node.js/Express**: RESTful API framework
- **MySQL/MariaDB**: Database
- **Socket.IO**: Real-time event system
- **JWT Authentication**: Secure user authentication
- **Nodemailer**: Email notifications

### Frontend
- **Nuxt 3**: Vue.js framework
- **Tailwind CSS**: Styling
- **Pinia**: State management
- **Socket.IO Client**: Real-time updates

## Installation

### Prerequisites
- Node.js (v14+)
- MySQL/MariaDB
- npm or yarn

### Backend Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd ticket-system/backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   JWT_SECRET=your_jwt_secret

   # Frontend URL (for links in emails)
   FRONTEND_URL=http://localhost:3001

   # Email Configuration
   MAIL_HOST=smtp.example.com
   MAIL_PORT=587
   MAIL_SECURE=false
   MAIL_USER=your_email@example.com
   MAIL_PASS=your_email_password
   MAIL_FROM_NAME=Ticket System
   MAIL_FROM_ADDRESS=no-reply@example.com
   ```

4. Create database and tables
   ```bash
   # Import the schema.sql file to your database
   mysql -u your_username -p your_database < database/schema.sql
   ```

5. Start the server
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd ../frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory
   ```
   NUXT_PUBLIC_API_BASE=http://localhost:3000/api
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3001`

## Database Schema

The system uses the following main tables:
- `users`: User accounts and permissions
- `tickets`: Support tickets
- `departments`: Organizational departments
- `categories`: Ticket categories
- `priorities`: Ticket priorities
- `statuses`: Ticket statuses
- `comments`: Ticket comments
- `attachments`: File attachments
- `ticket_history`: Audit trail of all changes

## API Endpoints

### Authentication
- `POST /api/users/login`: User login
- `POST /api/users/register`: User registration

### Tickets
- `GET /api/tickets`: List tickets
- `GET /api/tickets/:id`: Get ticket details
- `POST /api/tickets`: Create ticket
- `PUT /api/tickets/:id`: Update ticket
- `DELETE /api/tickets/:id`: Delete ticket
- `POST /api/tickets/:id/comments`: Add comment
- `GET /api/tickets/:id/comments`: Get comments
- `GET /api/tickets/:id/history`: Get ticket history
- `POST /api/tickets/:ticketId/assign`: Assign ticket

### Dashboard
- `GET /api/dashboard`: Get dashboard statistics

### Reference Data
- `GET /api/departments`: List departments
- `GET /api/categories`: List categories
- `GET /api/priorities`: List priorities
- `GET /api/statuses`: List statuses

## Maintenance and Support

### Backing Up Data

Regular database backups are recommended:

```bash
mysqldump -u your_username -p your_database > backup.sql
```

### Troubleshooting

**Email sending issues:**
- Check SMTP settings in .env file
- Verify network connectivity to the mail server
- Check mail server logs

**Socket connection problems:**
- Ensure frontend and backend are using compatible Socket.IO versions
- Check for firewall issues
- Verify CORS settings in backend

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- [Piti Phanthasombath] - Initial work - [https://github.com/PitiDev]

## Acknowledgments

- [Nuxt.js](https://nuxt.com/)
- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)