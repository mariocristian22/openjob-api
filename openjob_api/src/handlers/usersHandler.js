const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const UsersRepository = require('../repositories/UsersRepository');
const { validateUser, validateUserUpdate } = require('../validators');
const { getCache, setCache, deleteCache } = require('../utils/cacheHelper');

const usersRepo = new UsersRepository();

async function postUser(req, res, next) {
  try {
    const validatedData = validateUser(req.body);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const id = `user-${uuidv4()}`;

    const userId = await usersRepo.addUser({
      id,
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role || 'user',
    });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { id: userId },
    });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `users:${id}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.set('X-Data-Source', 'cache');
      return res.status(200).json({
        status: 'success',
        data: cached,
      });
    }

    const user = await usersRepo.getUserById(id);

    await setCache(cacheKey, user);

    res.set('X-Data-Source', 'database');
    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function putUser(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = validateUserUpdate(req.body);

    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }

    await usersRepo.updateUser(id, validatedData);

    // Invalidate cache detail user setiap ada perubahan data
    await deleteCache(`users:${id}`);

    return res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postUser, getUserById, putUser,
};
