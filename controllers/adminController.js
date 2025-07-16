import User from '../models/User.js';
import DiagnosticCenter from '../models/DiagnosticCenter.js';
import Appointment from '../models/Appointment.js';
import DiagnosticTest from '../models/DiagnosticTest.js';

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCenters = await DiagnosticCenter.countDocuments({ isActive: true });
    const totalAppointments = await Appointment.countDocuments();
    const totalTests = await DiagnosticTest.countDocuments({ isActive: true });

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('diagnosticCenterId', 'name')
      .populate('testId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Appointment stats by status
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // User stats by role
    const userStats = await User.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue stats (if needed)
    const revenueStats = await Appointment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCenters,
        totalAppointments,
        totalTests,
        recentAppointments,
        appointmentStats,
        userStats,
        revenueStats: revenueStats[0] || { totalRevenue: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    let query = {};
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .populate('diagnosticCenterId', 'name')
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Update User Status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).populate('diagnosticCenterId', 'name').select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Get All Appointments (Admin view)
const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, centerId } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by center
    if (centerId) {
      query.diagnosticCenterId = centerId;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('diagnosticCenterId', 'name')
      .populate('testId', 'name category price')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1 });

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};

// System Settings (Super Admin only)
const updateSystemSettings = async (req, res) => {
  try {
    const { maintenanceMode, allowRegistration, maxAppointmentsPerDay } = req.body;
    
    // In a real application, you'd store these in a settings collection
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      settings: {
        maintenanceMode,
        allowRegistration,
        maxAppointmentsPerDay
      }
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system settings',
      error: error.message
    });
  }
};

// Get System Logs (Super Admin only)
const getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, level } = req.query;
    
    // In a real application, you'd have a logs collection
    // For now, return mock data
    const logs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'User login successful',
        userId: '507f1f77bcf86cd799439011'
      },
      {
        timestamp: new Date(Date.now() - 3600000),
        level: 'warning',
        message: 'High API usage detected',
        details: 'User exceeded rate limit'
      }
    ];

    res.status(200).json({
      success: true,
      logs,
      totalPages: 1,
      currentPage: 1,
      total: logs.length
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system logs',
      error: error.message
    });
  }
};

export {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllAppointments,
  updateSystemSettings,
  getSystemLogs
};
