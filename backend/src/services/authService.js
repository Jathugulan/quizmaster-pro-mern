import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { getSystemSettings } from './settingService.js';
import { verifyGoogleToken } from '../utils/googleAuth.js';

export const register = async ({ name, username, email, password, photo }) => {
  // 1. Check if public registration is enabled in system settings
  const settings = await getSystemSettings();
  if (settings && settings.users && settings.users.allowRegistration === false) {
    const error = new Error('Public registration is currently disabled by administrator.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Check for duplicate username
  const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
  if (existingUsername) {
    const error = new Error('Username is already taken.');
    error.statusCode = 409;
    throw error;
  }

  // 3. Check for duplicate email
  const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingEmail) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // 4. Hash password with bcryptjs (min 10 salt rounds)
  const passwordHash = await hashPassword(password);

  // 5. Create user strictly with role = 'user'
  const user = await User.create({
    name: name.trim(),
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: 'user', // Forced: public registration can NEVER create an admin
    status: 'active',
    photo: photo || '',
    joinedAt: new Date(),
  });

  // 6. Generate JWT token
  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    user: user.toJSON(),
    token,
  };
};

export const login = async ({ identifier, password, role }) => {
  const cleanIdentifier = identifier.toLowerCase().trim();

  // 1. Search user by username OR email
  const user = await User.findOne({
    $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
  });

  if (!user) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  // 2. Check if account is suspended / blocked
  if (user.status === 'blocked') {
    const error = new Error('Your account has been suspended by an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Role check if explicitly provided
  if (role && user.role !== role) {
    const error = new Error(`Account does not have the required '${role}' role.`);
    error.statusCode = 401;
    throw error;
  }

  // 4. Verify password
  if (!user.passwordHash) {
    const error = new Error('This account was registered using Google Sign-In. Please click Continue with Google.');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  // 5. Generate JWT token
  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Google OAuth 2.0 / Google Identity Services Authentication
 * Verifies token, detects existing account by googleId or email, links or auto-registers student.
 */
export const googleLogin = async ({ credential, accessToken, token: rawToken }) => {
  // 1. Verify Google identity securely on server-side
  const googlePayload = await verifyGoogleToken({
    credential,
    accessToken,
    token: rawToken,
  });

  const { googleId, email, name, picture } = googlePayload;

  // 2. Look for existing account: First by googleId, then by verified email
  let user = await User.findOne({ googleId });
  let isNewUser = false;
  let isLinked = false;

  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      // Link Google identity to existing verified email account
      user.googleId = googleId;
      user.emailVerified = true;
      if (!user.photo && picture) {
        user.photo = picture;
      }
      await user.save();
      isLinked = true;
    }
  }

  // 3. If account still does not exist, perform automatic student registration
  if (!user) {
    const settings = await getSystemSettings();
    if (settings?.users?.allowRegistration === false) {
      const error = new Error('Public registration is currently disabled by administrator.');
      error.statusCode = 403;
      throw error;
    }

    // Generate unique username from email prefix
    let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (baseUsername.length < 3) {
      baseUsername = `student_${Math.floor(1000 + Math.random() * 9000)}`;
    }
    let uniqueUsername = baseUsername;
    let counter = 1;
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${baseUsername.slice(0, 24)}_${Math.floor(100 + Math.random() * 900)}${counter > 1 ? counter : ''}`;
      counter++;
    }

    // Create user strictly with role = 'user' (Student)
    user = await User.create({
      name: name || 'Google Scholar',
      username: uniqueUsername,
      email,
      googleId,
      authProvider: 'google',
      emailVerified: true,
      role: 'user', // STRICT: Social auth CANNOT self-assign admin roles
      status: 'active',
      photo: picture || '',
      joinedAt: new Date(),
    });

    isNewUser = true;
  }

  // 4. Check if account is suspended / blocked
  if (user.status === 'blocked') {
    const error = new Error('Your account has been suspended by an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // 5. Audit Logging
  try {
    const logType = isNewUser
      ? 'google_signup'
      : isLinked
      ? 'google_account_linked'
      : 'google_login';

    const logMsg = isNewUser
      ? `New student account registered via Google OAuth (${email}).`
      : isLinked
      ? `Linked Google OAuth identity (${email}) to existing account.`
      : `Student logged in via Google OAuth (${email}).`;

    await ActivityLog.create({
      type: logType,
      message: logMsg,
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      metadata: { email, googleId, isNewUser, isLinked },
    });
  } catch (logErr) {
    console.warn('[ActivityLog] Non-critical log creation notice:', logErr.message);
  }

  // 6. Generate standard application JWT session token
  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    user: user.toJSON(),
    token,
    isNewUser,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

export const updateProfile = async (userId, { name, email, photo, phone, username, bio }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (email && email.toLowerCase().trim() !== user.email) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail, _id: { $ne: userId } });
    if (existing) {
      const error = new Error('Email is already in use by another account.');
      error.statusCode = 409;
      throw error;
    }
    user.email = cleanEmail;
  }

  if (username && username.toLowerCase().trim() !== user.username) {
    const cleanUsername = username.toLowerCase().trim();
    const existing = await User.findOne({ username: cleanUsername, _id: { $ne: userId } });
    if (existing) {
      const error = new Error('Username is already taken.');
      error.statusCode = 409;
      throw error;
    }
    user.username = cleanUsername;
  }

  if (name) user.name = name.trim();
  if (photo !== undefined) user.photo = photo;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;

  await user.save();
  return user.toJSON();
};

export const updatePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.passwordHash) {
    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Current password does not match.');
      error.statusCode = 400;
      throw error;
    }
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return { message: 'Password updated successfully' };
};

export default {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  updatePassword,
};
