
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP Email
const sendOTPEmail = async (email, otp, type = 'registration') => {
  try {
    const transporter = createTransporter();
    
    const subject = type === 'registration' ? 'Verify Your Email - Registration OTP' : 'Password Reset OTP';
    const message = type === 'registration' 
      ? `Your OTP for email verification is: ${otp}. This OTP will expire in 10 minutes.`
      : `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: #333; font-size: 24px; letter-spacing: 3px;">${otp}</h3>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Register User (Step 1 - Generate OTP)
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, dateOfBirth, address, diagnosticCenterId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    let user;
    if (existingUser && !existingUser.isEmailVerified) {
      // Update existing unverified user
      user = existingUser;
      user.name = name;
      user.password = password;
      user.phone = phone;
      user.role = role || 'patient';
      user.dateOfBirth = dateOfBirth;
      user.address = address;
      user.diagnosticCenterId = diagnosticCenterId;
    } else {
      // Create new user
      user = new User({
        name,
        email,
        password,
        phone,
        role: role || 'patient',
        dateOfBirth,
        address,
        diagnosticCenterId,
        isActive: false,
        isEmailVerified: false
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    user.otpType = 'registration';
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, 'registration');
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Verify OTP and Complete Registration
const verifyRegistrationOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.otpType !== 'registration') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP type'
      });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Complete registration
    user.isEmailVerified = true;
    user.isActive = true;
    user.clearOTP();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId, type } = req.body;

    if (!userId || !type) {
      return res.status(400).json({
        success: false,
        message: 'User ID and type are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    user.otpType = type;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, otp, type);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
};

// Forgot Password (Step 1 - Generate OTP)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email, isActive: true, isEmailVerified: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or not verified'
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    user.otpType = 'password_reset';
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, 'password_reset');
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for password reset.',
      userId: user._id
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Forgot password request failed',
      error: error.message
    });
  }
};

// Verify Password Reset OTP
const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.otpType !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP type'
      });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      userId: user._id
    });
  } catch (error) {
    console.error('Password reset OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// Reset Password (Final step)
const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.clearOTP();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// Login User (Updated to check email verification)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive || !user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or email not verified'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('diagnosticCenterId');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

export {
  register,
  verifyRegistrationOTP,
  resendOTP,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
  login,
  getProfile
};
