/* CLAUDE GENERATED FILE */

const fs = require('fs');
const path = require('path');

// Log file path
const logFilePath = path.join(__dirname, '../../../logs/access-denied.log');

/**
 * Ensure user is authenticated
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.redirect('/auth/login');
}

/**
 * Ensure user has at least MODERATOR role
 */
function isModerator(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }

  if (req.user.role === 'MODERATOR' || req.user.role === 'ADMIN') {
    return next();
  }

  // Log insufficient privilege attempt
  logAccessDenied(req, 'MODERATOR');
  
  res.status(403).render('403', {
    title: '403 - Forbidden',
    layout: 'layouts/layout-full',
    message: 'You do not have permission to access this page.'
  });
}

/**
 * Ensure user has ADMIN role
 */
function isAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Log insufficient privilege attempt
  logAccessDenied(req, 'ADMIN');
  
  res.status(403).render('403', {
    title: '403 - Forbidden',
    layout: 'layouts/layout-full',
    message: 'You do not have permission to access this page. Admin access required.'
  });
}

/**
 * Log access denied attempts
 */
function logAccessDenied(req, requiredRole) {
  const timestamp = new Date().toISOString();
  const userId = req.user ? req.user._id : 'anonymous';
  const userRole = req.user ? req.user.role : 'none';
  const method = req.method;
  const reqPath = req.path;
  const ip = req.ip || req.connection.remoteAddress;

  const logEntry = `[${timestamp}] DENIED - User: ${userId} (${userRole}) | Required: ${requiredRole} | ${method} ${reqPath} | IP: ${ip}\n`;

  // Ensure logs directory exists
  const logsDir = path.dirname(logFilePath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Append to log file
  fs.appendFileSync(logFilePath, logEntry);
  
  console.log('ACCESS DENIED:', logEntry.trim());
}

module.exports = {
  isAuthenticated,
  isModerator,
  isAdmin,
  logAccessDenied
};