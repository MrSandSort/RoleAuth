const bcrypt = require('bcrypt');
const { issueToken } = require('../middleware/auth');
const { credentialsSchema, manageUserSchema } = require('../schemas/authSchema');
const { createUser, findUserByEmail } = require('../models/userModel');

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
  const token = issueToken(user);

  return res.status(201).json({ user, token });
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

  const token = issueToken(user);
  return res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
};

module.exports = {
  register,
  createManagedUser,
  login,
};
