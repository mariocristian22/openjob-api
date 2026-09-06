const { v4: uuidv4 } = require('uuid');
const BookmarksRepository = require('../repositories/BookmarksRepository');
const { getCache, setCache, deleteCache } = require('../utils/cacheHelper');

const bookmarksRepo = new BookmarksRepository();

async function postBookmark(req, res, next) {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const id = `bookmark-${uuidv4()}`;

    const bookmarkId = await bookmarksRepo.addBookmark({ id, user_id: userId, job_id: jobId });

    await deleteCache(`bookmarks:${userId}`);

    return res.status(201).json({
      status: 'success',
      message: 'Bookmark added successfully',
      data: { id: bookmarkId },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllBookmarks(req, res, next) {
  try {
    const userId = req.user.id;
    const cacheKey = `bookmarks:${userId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.set('X-Data-Source', 'cache');
      return res.status(200).json({
        status: 'success',
        data: { bookmarks: cached },
      });
    }

    const bookmarks = await bookmarksRepo.getBookmarksByUserId(userId);
    await setCache(cacheKey, bookmarks);

    return res.status(200).json({
      status: 'success',
      data: { bookmarks },
    });
  } catch (err) {
    next(err);
  }
}

async function getBookmarkById(req, res, next) {
  try {
    const { id } = req.params;
    const bookmark = await bookmarksRepo.getBookmarkById(id);
    return res.status(200).json({
      status: 'success',
      data: bookmark,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteBookmark(req, res, next) {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    await bookmarksRepo.deleteBookmarkByUserAndJob(userId, jobId);

    await deleteCache(`bookmarks:${userId}`);

    return res.status(200).json({
      status: 'success',
      message: 'Bookmark deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postBookmark, getAllBookmarks, getBookmarkById, deleteBookmark };
