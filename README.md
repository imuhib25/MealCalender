# Meal Calendar

A desktop application built with Electron for planning and managing meal schedules. This application allows you to organize your meals in a calendar view, making meal planning simple and convenient.

## Features

- 📅 Calendar view for meal planning
- 🍽️ Add, edit, and manage meals
- 💾 Local SQLite database for data persistence
- 🎨 Clean and intuitive user interface
- 🖥️ Cross-platform desktop application

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

## Installation

1. Clone the repository or download the project files:
   ```bash
   git clone <repository-url>
   cd MealCalender
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

Start the development application:
```bash
npm start
```

This will launch the Electron application window.

## Building for Distribution

To create a distributable executable for Windows:

```bash
npm run build
```

This will generate an NSIS installer in the `dist` folder that can be distributed to end users.

## Project Structure

```
MealCalender/
├── main.js              # Electron main process
├── preload.js           # Preload script for security isolation
├── index.html           # Main application UI
├── script.js            # Frontend application logic
├── style.css            # Application styles
├── db.js                # SQLite database initialization and management
├── package.json         # Project dependencies and scripts
├── assets/              # Application assets (icons, images, etc.)
└── README.md            # This file
```

## Technologies Used

- **Electron** - Cross-platform desktop application framework
- **SQLite3** - Lightweight database for local data storage
- **HTML/CSS/JavaScript** - Frontend user interface
- **Electron Builder** - Building and packaging for distribution

## License

ISC

## Author

Muhib

---

For issues or questions, feel free to open an issue in the repository.
