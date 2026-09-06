const UsersRepository = require('../repositories/UsersRepository');
const ApplicationsRepository = require('../repositories/ApplicationsRepository');
const BookmarksRepository = require('../repositories/BookmarksRepository');
const { deleteCache } = require('../utils/cacheHelper');

const usersRepo = new UsersRepository();
const applicationsRepo = new ApplicationsRepository();
const bookmarksRepo = new BookmarksRepository();

async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await usersRepo.getUserById(userId);
    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function getProfileApplications(req, res, next) {
  try {
    const userId = req.user.id;
    const applications = await applicationsRepo.getApplicationsByUserId(userId);
    return res.status(200).json({
      status: 'success',
      data: { applications },
    });
  } catch (err) {
    next(err);
  }
}

async function getProfileBookmarks(req, res, next) {
  try {
    const userId = req.user.id;
    const bookmarks = await bookmarksRepo.getBookmarksByUserId(userId);
    return res.status(200).json({
      status: 'success',
      data: { bookmarks },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, getProfileApplications, getProfileBookmarks };
