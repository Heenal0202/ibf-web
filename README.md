# Bennett Blockchain Club — React & MongoDB Application

Production-grade, fully modular React application for the **Bennett Blockchain Club** (`Bennett University`), featuring **MongoDB backend integration**, **Admin authentication**, **Candidate application tracking with sorting & filtering**, **Club member management (Add / Remove)**, WebGL2 multi-scene shader rendering (`wtc-gl`), real-time sand particle physics, and GSAP micro-interactions.

---

## 📁 Project & Folder Structure

```text
heenal_web_design/
├── public/
│   └── favicon.svg                    # Vector brand favicon
├── server/                            # Node.js & Express Backend
│   ├── data/
│   │   └── store.json                 # Resilient fallback store & seed data
│   ├── models/
│   │   ├── Application.js             # Mongoose Application schema
│   │   └── Member.js                  # Mongoose Member schema
│   ├── routes/
│   │   └── api.js                     # REST API routes (Auth, Applications, Members)
│   ├── db.js                          # MongoDB Mongoose connector with resilient fallback
│   └── index.js                       # Express server running on port 5000
├── src/
│   ├── components/                    # Reusable React UI Components
│   │   ├── Navbar.jsx                 # Top responsive navigation bar & mobile drawer
│   │   ├── Footer.jsx                 # Global multi-column footer
│   │   ├── JoinClubModal.jsx          # Interactive student membership modal & form
│   │   ├── Toast.jsx                  # Global floating toast notifications
│   │   ├── CopyChip.jsx               # One-click clipboard copy chip with state feedback
│   │   └── SandCanvas.jsx             # HTML5 physics sand particle simulation
│   ├── pages/                         # Route / Page Views
│   │   ├── Home.jsx                   # Hero, protocol features, gallery, 3D consensus
│   │   ├── Sponsors.jsx               # Strategic alliances & partner profiles
│   │   ├── Events.jsx                 # Sprints, hackathons & participation schedule
│   │   ├── Leads.jsx                  # Core team leads, advisors & recruitment
│   │   └── Admin.jsx                  # Admin login, candidate filtering/sorting, members CRUD
│   ├── webgl/                         # WebGL2 / GLSL Shader System
│   │   ├── shaders.js                 # Handcrafted GLSL shader programs
│   │   └── ScrollRendererManager.js   # Single-canvas WebGL2 viewport coordinator
│   ├── App.jsx                        # Root React orchestrator & hash router
│   ├── App.js                         # Standard App module alias
│   ├── main.jsx                       # React DOM entry mount point
│   └── index.js                       # Module entry alias
├── .env                               # Environment configurations (MongoDB, Admin credentials)
├── index.html                         # SPA HTML entry point
├── vite.config.js                     # Vite build & proxy configuration
├── style.css                          # Design system styling & responsive layout
└── package.json                       # Scripts & dependencies
```

---

## 🛡️ Admin Portal Details

- **Route**: `#/admin` (accessible via Navbar **Admin 🛡️** or Footer link)
- **Default Username**: `admin`
- **Default Password**: `admin`
*(Configurable inside `.env` via `ADMIN_USERNAME` and `ADMIN_PASSWORD`)*

### Admin Capabilities:
1. **Candidate Applications**:
   - Live view of all applications submitted via the **Join Club** modal.
   - **Search**: by candidate name, university email, or GitHub handle.
   - **Filter**: by application status (`Pending`, `Accepted`, `Rejected`), track, and academic year.
   - **Sort**: by date applied or candidate name (ascending/descending).
   - **Actions**: One-click **Accept & Add Member**, **Reject**, **Reset Pending**, or **Delete Record**.
2. **Member Management**:
   - Roster view with roles, track specializations, and contact handles.
   - **Add Member**: form to add new members directly into the database.
   - **Remove Member**: delete member from the club database.

---

## 🍃 MongoDB Configuration

Configured in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bennett_blockchain
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

> **Resilient Fallback**: If local MongoDB is running, Mongoose connects automatically. If MongoDB is offline, the backend seamlessly operates with local fallback storage (`server/data/store.json`) without crashing!

---

## 🚀 Getting Started

### 1. Environment Setup:
Copy the example environment file and configure if needed:
```bash
cp .env.example .env
```

### 2. Start Both Backend & Frontend Concurrently:
```bash
npm run dev
# or
npm start
```
- **Frontend**: [http://localhost:3000/](http://localhost:3000/)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Admin Portal**: [http://localhost:3000/#/admin](http://localhost:3000/#/admin)

### 2. Run Backend Only:
```bash
npm run server
```

### 3. Run Frontend Only:
```bash
npm run client
```

### 4. Build for Production:
```bash
npm run build
```
