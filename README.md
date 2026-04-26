# Freelance Platform MVP

This is a full-stack web application similar to a simplified freelance platform (like Upwork).

## Features
- **3 Roles**: Client (Individual/Company), Expert, and Admin.
- **Role-based Dashboards**:
  - **Admin**: Approve experts, view all orders, and assign experts to pending orders.
  - **Client**: Order services from a predefined list and view order status.
  - **Expert**: View assigned orders and mark them as completed.
- **Chat**: Simple polling-based chat for assigned orders.
- **Tech Stack**: React + Vite + TailwindCSS (Frontend) & Flask + SQLite + JWT (Backend).

---

## 1. Prerequisites

You will need the following installed on your machine:
- **Python 3.8+** (for the backend)
- **Node.js (18+) and npm** (for the frontend)

*(Note: If you don't have Node.js installed, please install it from https://nodejs.org/ first).*

---

## 2. Quick Start (Recommended)

The easiest way to start both the backend and frontend simultaneously is to use the provided run scripts:

**On Windows:**
Double-click the `run.bat` file, or run it in your terminal:
```bash
run.bat
```
This will automatically open two new command prompt windows, install any missing dependencies, and start the servers.

**On Mac/Linux:**
Open a terminal and run:
```bash
chmod +x run.sh
./run.sh
```

---

## 3. Running Manually

If you prefer to run the components manually:

### Backend

Open a terminal or command prompt in the project root:

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate  # On Windows

# Install the dependencies
pip install -r requirements.txt

# Run the seed script to initialize the database and create the first Admin user
python seed.py

# Run the Flask API server
python app.py
```
*The backend will run on `http://127.0.0.1:5000`.*

**Default Admin Credentials:**
- Email: `admin@platform.com`
- Password: `admin123`

---

## 3. Running the Frontend

Open a new terminal or command prompt in the project root:

```bash
# Navigate to the frontend directory
cd frontend

# Install all JavaScript dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 4. How to Test the Flow
1. Login as the default Admin and verify the Dashboard loads.
2. Register a new user as an **Expert** (upload any dummy PDF for the CV).
3. The Expert cannot login until approved. Login as Admin, go to the dashboard, and **Approve** the pending expert.
4. Register a new user as an **Individual** or **Company** (Client).
5. As the Client, go to "Services" and create an Order.
6. Login as Admin, see the new Order in the dashboard, and assign the approved Expert to it.
7. Login as the Client or the Expert, go to the Dashboard, click **Chat** on the assigned order, and test the simple messaging system.
