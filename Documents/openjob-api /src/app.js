require('dotenv').config();
const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Handlers
const { postUser, getUserById } = require('./handlers/usersHandler');
const { postCompany, getAllCompanies, getCompanyById, putCompany, deleteCompany } = require('./handlers/companiesHandler');
const { postCategory, getAllCategories, getCategoryById, putCategory, deleteCategory } = require('./handlers/categoriesHandler');
const { postJob, getAllJobs, getJobById, getJobsByCompanyId, getJobsByCategoryId, putJob, deleteJob } = require('./handlers/jobsHandler');
const { postAuthentication, putAuthentication, deleteAuthentication } = require('./handlers/authenticationsHandler');
const { postApplication, getAllApplications, getApplicationById, getApplicationsByUserId, getApplicationsByJobId, putApplication, deleteApplication } = require('./handlers/applicationsHandler');
const { postBookmark, getAllBookmarks, getBookmarkById, deleteBookmark } = require('./handlers/bookmarksHandler');
const { getProfile, getProfileApplications, getProfileBookmarks } = require('./handlers/profileHandler');

const app = express();
app.use(express.json());

// ── USERS ──────────────────────────────────────────────
app.post('/users', postUser);
app.get('/users/:id', getUserById);

// ── COMPANIES ──────────────────────────────────────────
app.get('/companies', getAllCompanies);
app.get('/companies/:id', getCompanyById);
app.post('/companies', authMiddleware, postCompany);
app.put('/companies/:id', authMiddleware, putCompany);
app.delete('/companies/:id', authMiddleware, deleteCompany);

// ── CATEGORIES ─────────────────────────────────────────
app.get('/categories', getAllCategories);
app.get('/categories/:id', getCategoryById);
app.post('/categories', authMiddleware, postCategory);
app.put('/categories/:id', authMiddleware, putCategory);
app.delete('/categories/:id', authMiddleware, deleteCategory);

// ── JOBS ───────────────────────────────────────────────
// NOTE: specific sub-routes must come BEFORE /:id
app.get('/jobs/company/:companyId', getJobsByCompanyId);
app.get('/jobs/category/:categoryId', getJobsByCategoryId);
app.get('/jobs', getAllJobs);
app.get('/jobs/:id', getJobById);
app.post('/jobs', authMiddleware, postJob);
app.put('/jobs/:id', authMiddleware, putJob);
app.delete('/jobs/:id', authMiddleware, deleteJob);

// ── AUTHENTICATIONS ────────────────────────────────────
app.post('/authentications', postAuthentication);
app.put('/authentications', putAuthentication);
app.delete('/authentications', authMiddleware, deleteAuthentication);

// ── APPLICATIONS ───────────────────────────────────────
app.post('/applications', authMiddleware, postApplication);
app.get('/applications', authMiddleware, getAllApplications);
app.get('/applications/user/:userId', authMiddleware, getApplicationsByUserId);
app.get('/applications/job/:jobId', authMiddleware, getApplicationsByJobId);
app.get('/applications/:id', authMiddleware, getApplicationById);
app.put('/applications/:id', authMiddleware, putApplication);
app.delete('/applications/:id', authMiddleware, deleteApplication);

// ── BOOKMARKS ──────────────────────────────────────────
app.post('/jobs/:jobId/bookmark', authMiddleware, postBookmark);
app.get('/jobs/:jobId/bookmark/:id', authMiddleware, getBookmarkById);
app.delete('/jobs/:jobId/bookmark', authMiddleware, deleteBookmark);
app.get('/bookmarks', authMiddleware, getAllBookmarks);

// ── PROFILE ────────────────────────────────────────────
app.get('/profile', authMiddleware, getProfile);
app.get('/profile/applications', authMiddleware, getProfileApplications);
app.get('/profile/bookmarks', authMiddleware, getProfileBookmarks);

// ── ERROR HANDLER ──────────────────────────────────────
const documentsRoutes = require('./routes/documentsRoutes');
app.use('/documents', documentsRoutes);

app.use(errorHandler);

module.exports = app;
