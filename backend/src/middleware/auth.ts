import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, JWTPayload } from '../types';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;

      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        res.status(401).json({ success: false, error: 'User not found' });
        return;
      }

      // Convert to plain object and add _id as string
      const userObject = user.toObject();
      req.user = {
        ...userObject,
        _id: (userObject._id as any).toString()
      };
      
      next();
    } catch (err) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
    return;
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: `User role '${req.user.role}' is not authorized to access this route` 
      });
      return;
    }

    next();
  };
}; 