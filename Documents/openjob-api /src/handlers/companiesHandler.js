const { v4: uuidv4 } = require('uuid');
const CompaniesRepository = require('../repositories/CompaniesRepository');
const { validateCompany } = require('../validators');
const { getCache, setCache, deleteCache } = require('../utils/cacheHelper');

const companiesRepo = new CompaniesRepository();

async function postCompany(req, res, next) {
  try {
    const validatedData = validateCompany(req.body);
    const id = `company-${uuidv4()}`;

    const companyId = await companiesRepo.addCompany({
      id,
      ...validatedData,
      owner_id: req.user.id,
    });

    await deleteCache(`companies:${id}`);

    return res.status(201).json({
      status: 'success',
      message: 'Company created successfully',
      data: { id: companyId },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllCompanies(req, res, next) {
  try {
    const companies = await companiesRepo.getAllCompanies();
    return res.status(200).json({
      status: 'success',
      data: { companies },
    });
  } catch (err) {
    next(err);
  }
}

async function getCompanyById(req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `companies:${id}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.set('X-Data-Source', 'cache');
      return res.status(200).json({
        status: 'success',
        data: cached,
      });
    }

    const company = await companiesRepo.getCompanyById(id);

    await setCache(cacheKey, company);

    return res.status(200).json({
      status: 'success',
      data: company,
    });
  } catch (err) {
    next(err);
  }
}

async function putCompany(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = validateCompany(req.body);
    await companiesRepo.updateCompany(id, validatedData);

    await deleteCache(`companies:${id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Company updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function deleteCompany(req, res, next) {
  try {
    const { id } = req.params;
    await companiesRepo.deleteCompany(id);

    await deleteCache(`companies:${id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Company deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postCompany, getAllCompanies, getCompanyById, putCompany, deleteCompany };
