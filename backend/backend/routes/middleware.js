/* global process */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET;

/**
 * authenticateToken
 * Verifies any valid JWT. Sets req.user on success.
 * Always enforced — no dev bypass.
 */
export function authenticateToken(req, res, next) {
  if (!SECRET) {
    return res.status(500).json({
      success: false,
      message: 'JWT_SECRET is not configured',
    });
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: No token provided' });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Access denied: Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

/**
 * adminAuth
 * Extends authenticateToken — additionally requires role === 'admin'.
 * Use this on all POST / PUT / PATCH routes that should be dashboard-only.
 */
export function adminAuth(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required',
      });
    }
    next();
  });
}

export default authenticateToken;
