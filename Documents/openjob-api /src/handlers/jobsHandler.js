const { v4: uuidv4 } = require('uuid');
const JobsRepository = require('../repositories/JobsRepository');
const { validateJob } = require('../validators');

const jobsRepo = new JobsRepository();

async function postJob(req, res, next) {
  try {
    const validatedData = validateJob(req.body);
    const id = `job-${uuidv4()}`;

    const jobId = await jobsRepo.addJob({ id, ...validatedData });

    return res.status(201).json({
      status: 'success',
      message: 'Job created successfully',
      data: { id: jobId },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllJobs(req, res, next) {
  try {
    const title = req.query.title || null;
    const companyName = req.query['company-name'] || null;

    const jobs = await jobsRepo.getAllJobs({ title, companyName });

    return res.status(200).json({
      status: 'success',
      data: { jobs },
    });
  } catch (err) {
    next(err);
  }
}

async function getJobById(req, res, next) {
  try {
    const { id } = req.params;
    const job = await jobsRepo.getJobById(id);
    return res.status(200).json({
      status: 'success',
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

async function getJobsByCompanyId(req, res, next) {
  try {
    const { companyId } = req.params;
    const jobs = await jobsRepo.getJobsByCompanyId(companyId);
    return res.status(200).json({
      status: 'success',
      data: { jobs },
    });
  } catch (err) {
    next(err);
  }
}

async function getJobsByCategoryId(req, res, next) {
  try {
    const { categoryId } = req.params;
    const jobs = await jobsRepo.getJobsByCategoryId(categoryId);
    return res.status(200).json({
      status: 'success',
      data: { jobs },
    });
  } catch (err) {
    next(err);
  }
}

async function putJob(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = validateJob(req.body);
    await jobsRepo.updateJob(id, validatedData);
    return res.status(200).json({
      status: 'success',
      message: 'Job updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function deleteJob(req, res, next) {
  try {
    const { id } = req.params;
    await jobsRepo.deleteJob(id);
    return res.status(200).json({
      status: 'success',
      message: 'Job deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postJob, getAllJobs, getJobById, getJobsByCompanyId, getJobsByCategoryId, putJob, deleteJob };
