import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000'
    : '');

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on page load
    const savedUser = localStorage.getItem('glacier_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('glacier_user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * login â€” calls POST /api/auth/login
   * On success stores { ...user, token } in state + localStorage
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        const msg = data.message || 'Invalid credentials';
        toast.error(msg);
        return { success: false, message: msg };
      }

      const loggedInUser = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,           // 'admin' | 'user'
        token: data.token,
        lastLogin: new Date().toISOString(),
        status: 'active',
      };

      setUser(loggedInUser);
      localStorage.setItem('glacier_user', JSON.stringify(loggedInUser));
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      toast.error('Login failed. Please try again.');
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      if (user?.token) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      localStorage.removeItem('glacier_user');
      toast.success('Logged out successfully');
    }
  };

  // â”€â”€ Session Sync (Multi-tab support) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === 'glacier_user' && !e.newValue) {
        setUser(null);
        if (user) toast.info('Session ended in another tab');
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, [user]);

  // â”€â”€ Auto Logout (Inactivity Timer) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let inactivityTimer;
    let lastActivity = Date.now();

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const timeoutLimit = 30 * 60 * 1000; // 30 minutes

      if (inactiveTime >= timeoutLimit) {
        if (user) {
          toast.error('Session expired due to inactivity');
          logout();
        }
      } else {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(checkInactivity, timeoutLimit - inactiveTime + 1000);
      }
    };

    const resetActivity = () => {
      lastActivity = Date.now();
    };

    if (user) {
      const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
      
      let throttleTimer;
      const throttledReset = () => {
        if (throttleTimer) return;
        throttleTimer = setTimeout(() => {
          resetActivity();
          throttleTimer = null;
        }, 1000);
      };

      events.forEach(event => {
        window.addEventListener(event, throttledReset);
      });

      checkInactivity();

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, throttledReset);
        });
        if (inactivityTimer) clearTimeout(inactivityTimer);
        if (throttleTimer) clearTimeout(throttleTimer);
      };
    }
  }, [user]);

  const hasPermission = () => true;
  const hasAnyPermissions = () => true;
  const hasAllRequiredPermissions = () => true;
  const isSuperAdmin = () => user?.role === 'admin';
  const getUserRole = () => user?.role || null;

  const value = {
    user,
    login,
    logout,
    hasPermission,
    hasAnyPermissions,
    hasAllRequiredPermissions,
    isSuperAdmin,
    getUserRole,
    loading,
    isAuthenticated: !!user,
    token: user?.token || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

