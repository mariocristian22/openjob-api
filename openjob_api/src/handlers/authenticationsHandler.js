require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsersRepository = require('../repositories/UsersRepository');
const AuthenticationsRepository = require('../repositories/AuthenticationsRepository');
const { validateLogin, validateRefreshToken, validateDeleteAuth } = require('../validators');
const AuthenticationError = require('../exceptions/AuthenticationError');
const NotFoundError = require('../exceptions/NotFoundError');

const usersRepo = new UsersRepository();
const authRepo = new AuthenticationsRepository();

async function postAuthentication(req, res, next) {
  try {
    const { email, password } = validateLogin(req.body);

    let user;
    try {
      user = await usersRepo.getUserByEmail(email);
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new AuthenticationError('Email or password is incorrect');
      }
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Email or password is incorrect');
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '3h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_KEY
    );

    await authRepo.addRefreshToken(refreshToken);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

async function putAuthentication(req, res, next) {
  try {
    const { refreshToken } = validateRefreshToken(req.body);

    await authRepo.verifyRefreshToken(refreshToken);

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    } catch (err) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '3h' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Access token refreshed',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteAuthentication(req, res, next) {
  try {
    const { refreshToken } = validateDeleteAuth(req.body);

    await authRepo.verifyRefreshToken(refreshToken);
    await authRepo.deleteRefreshToken(refreshToken);

    return res.status(200).json({
      status: 'success',
      message: 'Logout successful',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postAuthentication, putAuthentication, deleteAuthentication };
