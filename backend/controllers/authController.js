import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserByUsername, comparePassword, getUserCount } from '../models/User.js';

export const signup = (req, res) => {
  try {
    const { username, email, password, country, defaultCurrency } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existingUserByEmail = findUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUserByUsername = findUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const userCount = getUserCount();
    const role = userCount === 0 ? 'Admin' : 'Employee';

    const userId = createUser(username, email, password, role, country, defaultCurrency || 'USD');

    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, username, email, role, country, defaultCurrency: defaultCurrency || 'USD' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const signin = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        country: user.country,
        defaultCurrency: user.defaultCurrency,
        managerId: user.managerId
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
