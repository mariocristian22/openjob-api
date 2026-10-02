const { v4: uuidv4 } = require('uuid');
const CategoriesRepository = require('../repositories/CategoriesRepository');
const { validateCategory } = require('../validators');

const categoriesRepo = new CategoriesRepository();

async function postCategory(req, res, next) {
  try {
    const validatedData = validateCategory(req.body);
    const id = `category-${uuidv4()}`;

    const categoryId = await categoriesRepo.addCategory({ id, ...validatedData });

    return res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: { id: categoryId },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllCategories(req, res, next) {
  try {
    const categories = await categoriesRepo.getAllCategories();
    return res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const category = await categoriesRepo.getCategoryById(id);
    return res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (err) {
    next(err);
  }
}

async function putCategory(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = validateCategory(req.body);
    await categoriesRepo.updateCategory(id, validatedData);
    return res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await categoriesRepo.deleteCategory(id);
    return res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postCategory, getAllCategories, getCategoryById, putCategory, deleteCategory };
