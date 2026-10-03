import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Application from './models/Application.js';
import Member from './models/Member.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storePath = path.join(__dirname, 'data', 'store.json');

let isMongoConnected = false;
let mongoError = null;

function readLocalStore() {
  try {
    if (fs.existsSync(storePath)) {
      const data = fs.readFileSync(storePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading local store:', e);
  }
  return { applications: [], members: [] };
}

function writeLocalStore(data) {
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local store:', e);
  }
}

export async function connectDB(mongoUri) {
  const uri = mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bennett_blockchain';

  try {
    console.log(`🔌 Attempting to connect to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    mongoError = null;
    console.log('✅ Successfully connected to MongoDB!');

    // Seed initial data if database collections are empty
    const appCount = await Application.countDocuments();
    const memCount = await Member.countDocuments();
    if (appCount === 0 || memCount === 0) {
      const local = readLocalStore();
      if (appCount === 0 && local.applications?.length) {
        await Application.insertMany(local.applications.map(({ _id, ...app }) => app));
        console.log(`🌱 Seeded ${local.applications.length} applications into MongoDB`);
      }
      if (memCount === 0 && local.members?.length) {
        await Member.insertMany(local.members.map(({ _id, ...mem }) => mem));
        console.log(`🌱 Seeded ${local.members.length} members into MongoDB`);
      }
    }
  } catch (err) {
    isMongoConnected = false;
    mongoError = err.message;
    console.warn(`⚠️  MongoDB connection error (${err.message}). Operating with local store fallback.`);
  }

  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.warn('⚠️  MongoDB disconnected. Local store fallback active.');
  });

  mongoose.connection.on('reconnected', () => {
    isMongoConnected = true;
    mongoError = null;
    console.log('✅ MongoDB reconnected!');
  });
}

export function getDbStatus() {
  return {
    isMongoConnected,
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bennett_blockchain',
    mode: isMongoConnected ? 'MongoDB Live' : 'Local Fallback Storage',
    error: mongoError
  };
}

// Data access abstractions that seamlessly query MongoDB or fallback to store.json
export const dbService = {
  // Applications
  async getApplications(filter = {}, sort = { createdAt: -1 }) {
    if (isMongoConnected) {
      return await Application.find(filter).sort(sort).lean();
    }
    const store = readLocalStore();
    let apps = store.applications || [];

    // Filter
    if (filter.status) apps = apps.filter((a) => a.status === filter.status);
    if (filter.track) apps = apps.filter((a) => a.track === filter.track);
    if (filter.year) apps = apps.filter((a) => a.year === filter.year);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.fullName?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.handle?.toLowerCase().includes(q)
      );
    }

    // Sort
    apps.sort((a, b) => {
      if (sort.createdAt) {
        const diff = new Date(b.createdAt) - new Date(a.createdAt);
        return sort.createdAt === 1 ? -diff : diff;
      }
      if (sort.fullName) {
        const diff = (a.fullName || '').localeCompare(b.fullName || '');
        return sort.fullName === 1 ? diff : -diff;
      }
      return 0;
    });

    return apps;
  },

  async createApplication(appData) {
    if (isMongoConnected) {
      const newApp = new Application(appData);
      return await newApp.save();
    }
    const store = readLocalStore();
    const newApp = {
      _id: 'app_' + Date.now(),
      ...appData,
      status: appData.status || 'Pending',
      createdAt: new Date().toISOString()
    };
    store.applications = store.applications || [];
    store.applications.unshift(newApp);
    writeLocalStore(store);
    return newApp;
  },

  async updateApplication(id, updates) {
    if (isMongoConnected) {
      return await Application.findByIdAndUpdate(id, updates, { new: true });
    }
    const store = readLocalStore();
    const index = (store.applications || []).findIndex((a) => String(a._id) === String(id));
    if (index !== -1) {
      store.applications[index] = { ...store.applications[index], ...updates };
      writeLocalStore(store);
      return store.applications[index];
    }
    return null;
  },

  async deleteApplication(id) {
    if (isMongoConnected) {
      return await Application.findByIdAndDelete(id);
    }
    const store = readLocalStore();
    const initialLen = store.applications?.length || 0;
    store.applications = (store.applications || []).filter((a) => String(a._id) !== String(id));
    writeLocalStore(store);
    return store.applications.length < initialLen;
  },

  // Members
  async getMembers() {
    if (isMongoConnected) {
      return await Member.find().sort({ addedAt: -1 }).lean();
    }
    const store = readLocalStore();
    return store.members || [];
  },

  async addMember(memberData) {
    if (isMongoConnected) {
      const newMember = new Member(memberData);
      return await newMember.save();
    }
    const store = readLocalStore();
    const newMember = {
      _id: 'mem_' + Date.now(),
      ...memberData,
      addedAt: new Date().toISOString()
    };
    store.members = store.members || [];
    store.members.unshift(newMember);
    writeLocalStore(store);
    return newMember;
  },

  async removeMember(id) {
    if (isMongoConnected) {
      return await Member.findByIdAndDelete(id);
    }
    const store = readLocalStore();
    const initialLen = store.members?.length || 0;
    store.members = (store.members || []).filter((m) => String(m._id) !== String(id));
    writeLocalStore(store);
    return store.members.length < initialLen;
  }
};
