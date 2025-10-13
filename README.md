# Ticket Management System

A comprehensive ticket management system built with Nuxt 3, Node.js, and MySQL/MariaDB featuring real-time notifications, email alerts, and a modern UI with advanced analytics and reporting capabilities.

## Features

- **Ticket Management**: Create, view, update, and delete support tickets
- **User Management**: Role-based access control (admin, manager, agent, user)
- **Department & Category Organization**: Organize tickets by department and category
- **Real-time Notifications**: Instant notifications via Socket.IO when tickets are assigned
- **Notification Center**: Dedicated page to view, filter, and manage all notifications
- **Email Notifications**: Automated emails for ticket assignments and updates
- **Advanced Dashboard**: Interactive charts and analytics with Chart.js and ApexCharts
- **Data Visualization**: Financial charts and trading views integration
- **Export Capabilities**: PDF generation with jsPDF and Excel export with xlsx
- **Mobile Responsive**: Modern UI that works across devices with Tailwind CSS
- **History Tracking**: Complete audit trail of all ticket changes
- **AI Integration**: Google Generative AI integration for enhanced features

## Tech Stack

### Backend
- **Node.js/Express**: RESTful API framework
- **MySQL/MariaDB**: Database
- **Socket.IO**: Real-time event system
- **JWT Authentication**: Secure user authentication
- **Nodemailer**: Email notifications

### Frontend
- **Nuxt 3**: Vue.js framework
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Pinia**: State management for Vue.js
- **Socket.IO Client**: Real-time updates
- **Chart.js**: Interactive charts and data visualization
- **ApexCharts**: Advanced charting library
- **TradingView**: Financial charts integration
- **jsPDF**: PDF generation
- **xlsx**: Excel file handling
- **Vue Toastification**: Toast notifications
- **Headless UI**: Unstyled UI components
- **Heroicons**: Icon library
- **Google Generative AI**: AI-powered features

## Installation

### Prerequisites
- Node.js (v14+)
- MySQL/MariaDB
- npm or yarn

### Backend Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd ticket-application/backend
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
   npm start
   ```

   Note: Check the package.json file for available scripts.

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

   Note: Adjust the API base URL according to your backend configuration.

4. Start the development server
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000` (or the port specified in your Nuxt configuration)

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

### Notifications
- `GET /api/notifications`: Get user notifications
- `GET /api/notifications/unread-count`: Get unread notification count
- `PUT /api/notifications/:id/read`: Mark notification as read
- `PUT /api/notifications/mark-all-read`: Mark all notifications as read
- `DELETE /api/notifications/:id`: Delete notification

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

## Project Structure

```
ticket-application/
├── backend/                 # Node.js/Express API server
│   ├── .env                # Environment configuration
│   ├── package.json        # Backend dependencies
│   └── ...                 # Backend source files
├── frontend/               # Nuxt 3 application
│   ├── pages/              # Vue.js pages
│   ├── components/         # Reusable Vue components
│   ├── composables/        # Vue composables
│   ├── assets/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── ...                 # Frontend source files
├── README.md              # Project documentation
└── .gitignore             # Git ignore rules
```

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm start           # Start production server
npm run dev         # Start development server (if available)
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run generate    # Generate static site
npm run preview     # Preview production build
```

## Contributors

- [Piti Phanthasombath] - Initial work - [https://github.com/PitiDev]

## Acknowledgments

- [Nuxt.js](https://nuxt.com/) - The Intuitive Vue Framework
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [Socket.IO](https://socket.io/) - Bidirectional and low-latency communication
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) - Simple yet flexible JavaScript charting
- [ApexCharts](https://apexcharts.com/) - Modern charting library
- [Google AI](https://ai.google.dev/) - Generative AI capabilities