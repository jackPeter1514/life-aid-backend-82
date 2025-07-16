import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  role: {
    type: String,
    enum: ['patient', 'admin', 'diagnostic_center_admin', 'super_admin'],
    default: 'patient'
  },
  permissions: [{
    type: String,
    enum: [
      'read_users', 'create_users', 'update_users', 'delete_users',
      'read_centers', 'create_centers', 'update_centers', 'delete_centers',
      'read_tests', 'create_tests', 'update_tests', 'delete_tests',
      'read_appointments', 'create_appointments', 'update_appointments', 'delete_appointments',
      'manage_system', 'manage_iam'
    ]
  }],
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  diagnosticCenterId: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        this.permissions = [
          'read_users', 'create_users', 'update_users', 'delete_users',
          'read_centers', 'create_centers', 'update_centers', 'delete_centers',
          'read_tests', 'create_tests', 'update_tests', 'delete_tests',
          'read_appointments', 'create_appointments', 'update_appointments', 'delete_appointments',
          'manage_system', 'manage_iam'
        ];
        break;
      case 'admin':
        this.permissions = [
          'read_users', 'create_users', 'update_users',
          'read_centers', 'create_centers', 'update_centers',
          'read_tests', 'create_tests', 'update_tests',
          'read_appointments', 'create_appointments', 'update_appointments'
        ];
        break;
      case 'diagnostic_center_admin':
        this.permissions = [
          'read_tests', 'create_tests', 'update_tests',
          'read_appointments', 'update_appointments'
        ];
        break;
      case 'patient':
        this.permissions = ['read_centers', 'read_tests', 'create_appointments'];
        break;
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

export default mongoose.model('User', userSchema);
