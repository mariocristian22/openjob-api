const { v4: uuidv4 } = require('uuid');
const ApplicationsRepository = require('../repositories/ApplicationsRepository');
const { validateApplication, validateApplicationStatus } = require('../validators');
const { publishApplicationMessage } = require('../rabbitmq/connection');
const { getCache, setCache, deleteCache, deleteCacheByPattern } = require('../utils/cacheHelper');

const applicationsRepo = new ApplicationsRepository();

async function postApplication(req, res, next) {
  try {
    const validatedData = validateApplication(req.body);
    const id = `application-${uuidv4()}`;
    const applicationId = await applicationsRepo.addApplication({ id, ...validatedData });

    await publishApplicationMessage(applicationId);

    // Invalidate cache list lamaran
    await deleteCacheByPattern(`applications:user:*`);
    await deleteCacheByPattern(`applications:job:*`);

    return res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: { id: applicationId },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllApplications(req, res, next) {
  try {
    const applications = await applicationsRepo.getAllApplications();
    return res.status(200).json({
      status: 'success',
      data: { applications },
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `applications:${id}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.set('X-Data-Source', 'cache');
      return res.status(200).json({
        status: 'success',
        data: cached,
      });
    }

    const application = await applicationsRepo.getApplicationById(id);
    await setCache(cacheKey, application);

    return res.status(200).json({
      status: 'success',
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationsByUserId(req, res, next) {
  try {
    const { userId } = req.params;
    const cacheKey = `applications:user:${userId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.set('X-Data-Source', 'cache');
      return res.status(200).json({
        status: 'success',
        data: { applications: cached },
      });
    }

    const applications = await applicationsRepo.getApplicationsByUserId(userId);
    await setCache(cacheKey, applications);

    return res.status(200).json({
      status: 'success',
      data: { applications },
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationsByJobId(req, res, next) {
  try {
    const { jobId } = req.params;
    const cacheKey = `applications:job:${jobId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.set('X-Data-Source', 'cache');
      return res.status(200).json({
        status: 'success',
        data: { applications: cached },
      });
    }

    const applications = await applicationsRepo.getApplicationsByJobId(jobId);
    await setCache(cacheKey, applications);

    return res.status(200).json({
      status: 'success',
      data: { applications },
    });
  } catch (err) {
    next(err);
  }
}

async function putApplication(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = validateApplicationStatus(req.body);
    await applicationsRepo.updateApplicationStatus(id, validatedData);

    // Invalidate semua cache terkait
    await deleteCache(`applications:${id}`);
    await deleteCacheByPattern(`applications:user:*`);
    await deleteCacheByPattern(`applications:job:*`);

    return res.status(200).json({
      status: 'success',
      message: 'Application status updated',
    });
  } catch (err) {
    next(err);
  }
}

async function deleteApplication(req, res, next) {
  try {
    const { id } = req.params;
    await applicationsRepo.deleteApplication(id);

    await deleteCache(`applications:${id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Application deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postApplication, getAllApplications, getApplicationById,
  getApplicationsByUserId, getApplicationsByJobId,
  putApplication, deleteApplication,
};
