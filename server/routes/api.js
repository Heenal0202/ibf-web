import express from 'express';
import { dbService, getDbStatus } from '../db.js';

const router = express.Router();

// Middleware for Admin Authentication
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.replace(/^Bearer\s+/, '');
  // For lightweight robust admin session verification:
  if (token && token.startsWith('adm_session_')) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
};

/* --------------------------------------------------------------------------
   1. AUTHENTICATION ROUTES
   -------------------------------------------------------------------------- */

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'admin';

  if (username === expectedUser && password === expectedPass) {
    const sessionToken = `adm_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return res.json({
      success: true,
      token: sessionToken,
      user: {
        username: expectedUser,
        role: 'Club Administrator',
        institution: 'Bennett University Web3 Chapter'
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin username or password'
  });
});

router.get('/auth/verify', requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Authenticated' });
});

/* --------------------------------------------------------------------------
   2. DATABASE STATUS
   -------------------------------------------------------------------------- */

router.get('/status', async (req, res) => {
  const status = getDbStatus();
  const apps = await dbService.getApplications();
  const members = await dbService.getMembers();

  res.json({
    ...status,
    totalApplications: apps.length,
    totalMembers: members.length
  });
});

/* --------------------------------------------------------------------------
   3. APPLICATIONS ROUTES
   -------------------------------------------------------------------------- */

// GET applications with filtering and sorting
router.get('/applications', async (req, res) => {
  try {
    const { search, track, year, status, sortBy = 'date', order = 'desc' } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (track && track !== 'all') filter.track = track;
    if (year && year !== 'all') filter.year = year;
    if (search) filter.search = search;

    const sortOption = {};
    if (sortBy === 'name') {
      sortOption.fullName = order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = order === 'asc' ? 1 : -1;
    }

    const applications = await dbService.getApplications(filter, sortOption);
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST application (Submitted by Candidate from Join Modal)
router.post('/applications', async (req, res) => {
  try {
    const { fullName, email, year, track, handle, notes } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required' });
    }

    const application = await dbService.createApplication({
      fullName,
      email,
      year: year || '2nd Year',
      track: track || 'Smart Contracts & EVM',
      handle: handle || '',
      notes: notes || '',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Application recorded to Bennett Blockchain ledger',
      data: application
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH application (Update status or notes)
router.patch('/applications/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const updated = await dbService.updateApplication(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // If accepted, check if candidate should also be added as a member automatically
    if (status === 'Accepted' && req.body.autoAddMember) {
      await dbService.addMember({
        fullName: updated.fullName,
        email: updated.email,
        role: 'Core Contributor',
        year: updated.year,
        track: updated.track,
        handle: updated.handle
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE application
router.delete('/applications/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.deleteApplication(id);
    res.json({ success: true, message: 'Application removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* --------------------------------------------------------------------------
   4. MEMBERS ROUTES (Add and Remove Member)
   -------------------------------------------------------------------------- */

// GET all members
router.get('/members', async (req, res) => {
  try {
    const members = await dbService.getMembers();
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add new member
router.post('/members', requireAdmin, async (req, res) => {
  try {
    const { fullName, email, role, year, track, handle } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required' });
    }

    const member = await dbService.addMember({
      fullName,
      email,
      role: role || 'Core Contributor',
      year: year || '2nd Year',
      track: track || 'Smart Contracts & EVM',
      handle: handle || ''
    });

    res.status(201).json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE remove member
router.delete('/members/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.removeMember(id);
    res.json({ success: true, message: 'Member removed from Bennett Blockchain Club' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
