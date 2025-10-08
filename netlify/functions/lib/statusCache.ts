// Simple file-based cache for lead qualification status updates
// This is for demo/testing purposes only

import * as fs from 'fs';
import * as path from 'path';

interface StatusUpdate {
  runId: string;
  status: string;
  statusMessage: string;
  qualified?: boolean;
  output?: string;
  callSummary?: string;
  callNotes?: string;
  timestamp?: string;
}

// File paths for cache storage
const CACHE_DIR = '/tmp/lead-qualification-cache';
const STATUS_CACHE_FILE = path.join(CACHE_DIR, 'status-cache.json');
const LATEST_RUNID_FILE = path.join(CACHE_DIR, 'latest-runid.txt');

// Ensure cache directory exists
const ensureCacheDir = (): void => {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
};

// Load status cache from file
const loadStatusCache = (): Map<string, StatusUpdate> => {
  try {
    ensureCacheDir();
    if (fs.existsSync(STATUS_CACHE_FILE)) {
      const data = fs.readFileSync(STATUS_CACHE_FILE, 'utf8');
      const cacheData = JSON.parse(data);
      return new Map(Object.entries(cacheData));
    }
  } catch (error) {
    console.error('Error loading status cache:', error);
  }
  return new Map();
};

// Save status cache to file
const saveStatusCache = (cache: Map<string, StatusUpdate>): void => {
  try {
    ensureCacheDir();
    const cacheData = Object.fromEntries(cache);
    fs.writeFileSync(STATUS_CACHE_FILE, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error('Error saving status cache:', error);
  }
};

// Load latest runId from file
const loadLatestRunId = (): string | null => {
  try {
    ensureCacheDir();
    if (fs.existsSync(LATEST_RUNID_FILE)) {
      return fs.readFileSync(LATEST_RUNID_FILE, 'utf8').trim();
    }
  } catch (error) {
    console.error('Error loading latest runId:', error);
  }
  return null;
};

// Save latest runId to file
const saveLatestRunId = (runId: string): void => {
  try {
    ensureCacheDir();
    fs.writeFileSync(LATEST_RUNID_FILE, runId);
  } catch (error) {
    console.error('Error saving latest runId:', error);
  }
};

export const cacheStatusUpdate = (statusUpdate: StatusUpdate): void => {
  const cache = loadStatusCache();
  cache.set(statusUpdate.runId, {
    ...statusUpdate,
    timestamp: new Date().toISOString()
  });
  saveStatusCache(cache);
  saveLatestRunId(statusUpdate.runId);
  console.log(`Cached status update for runId: ${statusUpdate.runId}`);
  console.log(`Cache after save - size: ${cache.size}, keys:`, Array.from(cache.keys()));
};

export const getCachedStatus = (runId: string): StatusUpdate | null => {
  const cache = loadStatusCache();
  const status = cache.get(runId);
  console.log(`Retrieved cached status for runId: ${runId}`, status);
  console.log(`Cache size: ${cache.size}, Cache keys:`, Array.from(cache.keys()));
  return status || null;
};

export const getLatestRunId = (): string | null => {
  const latestRunId = loadLatestRunId();
  console.log(`Retrieved latest runId: ${latestRunId}`);
  return latestRunId;
};

export const setLatestRunId = (runId: string): void => {
  saveLatestRunId(runId);
  console.log(`Set latest runId: ${runId}`);
};
