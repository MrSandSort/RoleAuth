const bcrypt = require('bcrypt');
const { credentialsSchema, manageUserSchema, refreshTokenSchema } = require('../schemas/authSchema');
const { createUser, findUserByEmail } = require('../models/userModel');
const { issueAccessToken, createRefreshToken, rotateRefreshToken } = require('../services/tokenService');

const register = async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = createUser(email, passwordHash, 'user');

  return res.status(201).json({ user });
};

const createManagedUser = async (req, res) => {
  const parsed = manageUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password, role } = parsed.data;
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser = createUser(email, passwordHash, role);
  return res.status(201).json({ user: newUser });
};

const login = async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = issueAccessToken(user);
  const { refreshToken, refreshTokenExpiresAt } = createRefreshToken(user.id);
  return res.json({ accessToken, refreshToken, refreshTokenExpiresAt });
};

const refreshTokens = (req, res) => {
  const parsed = refreshTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const rotated = rotateRefreshToken(parsed.data.refreshToken);
  if (!rotated) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  return res.json(rotated);
};

module.exports = {
  register,
  createManagedUser,
  login,
  refreshTokens,
};
