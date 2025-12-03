const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/userModel');
const {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  purgeExpiredRefreshTokens,
} = require('../models/refreshTokenModel');

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);

const issueAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

const createRefreshToken = async (userId) => {
  await purgeExpiredRefreshTokens();
  const token = crypto.randomBytes(48).toString('hex');
  const refreshTokenExpiresAt = Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;
  await saveRefreshToken(token, userId, refreshTokenExpiresAt);
  return { refreshToken: token, refreshTokenExpiresAt };
};

const rotateRefreshToken = async (incomingRefreshToken) => {
  const record = await findRefreshToken(incomingRefreshToken);
  if (!record) {
    return null;
  }

  if (record.expiresAt <= Date.now()) {
    deleteRefreshToken(incomingRefreshToken);
    return null;
  }

  const user = await findUserById(record.userId);
  if (!user) {
    await deleteRefreshToken(incomingRefreshToken);
    return null;
  }

  await deleteRefreshToken(incomingRefreshToken);

  const accessToken = issueAccessToken(user);
  const { refreshToken, refreshTokenExpiresAt } = await createRefreshToken(user.id);

  return { accessToken, refreshToken, refreshTokenExpiresAt };
};

module.exports = {
  issueAccessToken,
  createRefreshToken,
  rotateRefreshToken,
};
