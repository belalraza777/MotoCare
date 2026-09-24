import { getAuth, clerkClient } from '@clerk/express';
import { User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

// In-memory cache for user data
const userCache = new Map<string, { user: any; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes


// Middleware to require authentication and populate req.localUser
export const requireAuth = asyncHandler(async (req, res, next) => {

  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    throw new ApiError(401, 'Unauthorized');
  }

  // 1. Check cache first — skip DB entirely if hit
  const cached = userCache.get(clerkId);
  if (cached && cached.expiresAt > Date.now()) {
    req.localUser = cached.user;
    return next();
  }

  // 2. Cache miss — hit DB
  let user = await User.findOne({ clerkId });

  // 3. Still not found — lazy-create from Clerk
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    user = await User.create({
      clerkId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
    });
  }

  // 4. Populate cache for next request
  userCache.set(clerkId, { user, expiresAt: Date.now() + CACHE_TTL });

  req.localUser = user;
  next();
});