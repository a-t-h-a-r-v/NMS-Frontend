# GoNMS Frontend - Network Monitoring Dashboard

A modern React-based dashboard for network device monitoring with real-time telemetry visualization, secure authentication, and role-based access control.

## Features

- 🔐 **RSA-Encrypted Login**: Client-side encryption with jsencrypt
- 📊 **Interactive Charts**: Recharts-powered visualizations (Line, Area, Bar, Pie, Radar)
- 🎨 **Modern UI**: Tailwind CSS 4 with responsive design
- 🔍 **Device Discovery**: Automated CIDR network scanning
- 👥 **User Management**: Admin panel for user/permission configuration
- 🚨 **Real-Time Alerts**: Color-coded severity indicators
- 📱 **Responsive Design**: Mobile-friendly interface
- 🛡️ **Role-Based Views**: Admin and user-specific features

## Tech Stack

- **Framework**: React 19.2
- **Routing**: React Router DOM 7.10
- **Styling**: Tailwind CSS 4 (Vite plugin)
- **Charts**: Recharts 3.5
- **Icons**: Lucide React 0.556
- **HTTP Client**: Axios 1.13
- **Encryption**: JSEncrypt 3.5
- **Build Tool**: Vite 7.2

## Prerequisites

- **Node.js**: 20.19.0 or 22.12.0+
- **npm**: 8.0.0+
- **Backend API**: Go backend running on configured URL

## Installation

### 1. Clone Repository

```bash
git clone 
cd 
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root:

```env
VITE_API_URL=http://192.168.122.5:8080/api
```

For production:
```env
VITE_API_URL=https://your-domain.com/api
```

### 4. Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:5173`

### 5. Production Build

```bash
npm run build
npm run preview
```

Build output in `./dist` directory.

## Project Structure

```
src/
├── App.jsx                 # Main router and layout
├── Login.jsx               # Authentication page
├── Dashboard.jsx           # Device overview with search/scan
├── DeviceDetail.jsx        # Comprehensive telemetry visualization
├── Alerts.jsx              # Active alert monitoring
├── Logs.jsx                # System log viewer (Admin)
├── Settings.jsx            # Configuration panel (Admin)
├── AdminUsers.jsx          # User/permission management (Admin)
├── utils/
│   └── auth.js             # Authentication utilities
├── assets/                 # Static resources
├── main.jsx                # React entry point
└── index.css               # Global Tailwind imports
```

## Key Components

### Authentication (`Login.jsx`)

1. Fetches RSA public key from backend
2. Encrypts credentials with JSEncrypt
3. Sends Base64-encoded payload
4. Stores JWT token + user profile in localStorage
5. Axios interceptor adds `Authorization` header

**Example Flow:**
```javascript
// Fetch public key
GET /api/auth/key
→ { publicKey: "-----BEGIN PUBLIC KEY-----..." }

// Encrypt credentials
const encryptor = new JSEncrypt();
encryptor.setPublicKey(publicKey);
const payload = encryptor.encrypt(JSON.stringify({username, password}));

// Authenticate
POST /api/login
Body: { payload: "base64_encrypted_string" }
→ { token: "jwt_token", user: {...} }
```

### Dashboard (`Dashboard.jsx`)

- **Device Cards**: Status indicators (Online/Offline/Paused/Unknown)
- **Search**: Real-time filtering with debounce
- **Actions**: Edit, Pause/Resume, Delete (permission-based)
- **Network Scan**: Admin-only CIDR discovery
- **Conflict Resolution**: Handles duplicate IP addresses

**Permissions:**
- `can_write: true` → Full edit/delete access
- `can_write: false` → Read-only view with lock icon

### Device Detail (`DeviceDetail.jsx`)

Comprehensive telemetry dashboard with 6 visualization types:

1. **CPU Load Trend** (Area Chart)
   - 1-minute and 5-minute load averages
   - Gradient fill for visual appeal

2. **Memory & Swap** (Line Chart)
   - Real-time RAM and swap utilization
   - Step interpolation for accurate readings

3. **Network Traffic** (Stacked Area Chart)
   - Inbound (RX) and Outbound (TX) KB/s
   - Dual gradient overlays

4. **Protocol Distribution** (Pie Chart)
   - TCP/UDP/ICMP packet breakdown
   - Color-coded segments

5. **Interface Traffic** (Horizontal Bar Chart)
   - RX/TX bytes per interface
   - Stacked bars for comparison

6. **Storage Utilization** (Progress Bars)
   - Disk usage percentage
   - Color-coded thresholds (90% red, 70% yellow)

### Admin Features

#### User Management (`AdminUsers.jsx`)
- Create/edit users with roles (admin/user)
- Email configuration
- Secure password hashing (backend)
- Device permission matrix with toggle switches

#### System Logs (`Logs.jsx`)
- Real-time log streaming (5s refresh)
- Color-coded severity (ERROR: red, INFO: green)
- Monospaced terminal-style display

#### Settings (`Settings.jsx`)
- Poll interval configuration
- SNMP timeout adjustment
- Data retention policy

## Routing & Guards

```javascript
// Public Routes
/login                        → Login page

// Protected Routes (Authenticated)
/                            → Dashboard
/device/:id                  → Device Detail
/alerts                      → Alerts

// Admin Routes (Admin role required)
/logs                        → System Logs
/settings                    → Configuration
/users                       → User Management
```

**Route Protection:**
```javascript
// PrivateRoute checks authentication
const { token, user } = getSession();
if (!token) return ;

// AdminRoute checks role
if (adminOnly && user?.role !== 'admin') return ;
```

## API Integration

All API calls use Axios with automatic token injection:

```javascript
// Setup (in auth.js)
axios.interceptors.request.use(config => {
  const { token } = getSession();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Usage
const devices = await axios.get(`${API_URL}/devices`);
await axios.post(`${API_URL}/devices`, { hostname, ip, community });
```

**Error Handling:**
- `401 Unauthorized` → Auto-logout and redirect to login
- `403 Forbidden` → Permission denied alert
- `409 Conflict` → Duplicate IP modal with overwrite option

## Styling

### Tailwind CSS 4

Uses core utility classes (no JIT compilation required):

```jsx
// Status-based styling

```

**Key Patterns:**
- `bg-slate-900` → Dark sidebar
- `text-blue-600` → Primary actions
- `hover:bg-blue-700` → Interactive states
- `shadow-xl` → Elevated modals
- `transition-colors` → Smooth animations

### Responsive Breakpoints

- `md:` → 768px+ (tablets)
- `lg:` → 1024px+ (desktops)
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

## Browser Storage

**⚠️ Important:** This application uses `localStorage` for session management. If deploying as Claude artifacts, convert to in-memory state storage.

**Current Storage:**
```javascript
localStorage.setItem('nms_token', token);
localStorage.setItem('nms_user', JSON.stringify(user));
```

**For Artifacts (if needed):**
```javascript
// Convert to useState
const [session, setSession] = useState({ token: null, user: null });
```

## Security Features

✅ **Client-Side Encryption**: Credentials never sent in plain text  
✅ **Token Management**: Automatic expiration handling  
✅ **CORS Protection**: Backend validates origin  
✅ **XSS Prevention**: React escapes all user input  
✅ **CSRF Protection**: JWT stateless authentication  

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (HMR enabled) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint code quality check |

## Browser Support

- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅

## Troubleshooting

### "Network Error" on Login
```bash
# Check backend is running
curl http://192.168.122.5:8080/api/auth/key

# Verify CORS headers
# Backend should return: Access-Control-Allow-Origin: *
```

### Charts Not Rendering
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Encryption Failed"
- Public key not loaded → Check `/api/auth/key` endpoint
- Invalid credentials format → Verify JSON structure

### Build Errors
```bash
# Ensure Node version compatibility
node --version  # Should be 20.19.0 or 22.12.0+

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Performance Optimization

- **Code Splitting**: React Router lazy loading (if needed)
- **Chart Throttling**: 30-second refresh intervals
- **Search Debounce**: 300ms delay to reduce API calls
- **Concurrent Requests**: Avoid sequential fetches

## Deployment

### Static Hosting (Nginx)

```nginx
server {
    listen 80;
    server_name nms.example.com;
    root /var/www/nms-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Contributing

1. Follow React best practices (functional components, hooks)
2. Use ESLint configuration provided
3. Maintain Tailwind utility-first approach
4. Add TypeScript types if migrating (`.jsx` → `.tsx`)

## License

MIT License

## Support

- Issues: <repository-url>/issues
- Documentation: <docs-url>
- Discord: <community-invite>
