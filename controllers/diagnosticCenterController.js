import DiagnosticCenter from '../models/DiagnosticCenter.js';
import User from '../models/User.js';

// Create Diagnostic Center
const createCenter = async (req, res) => {
  try {
    const { name, description, address, phone, email, operatingHours, services, adminId } = req.body;

    // Verify admin user exists if provided
    if (adminId) {
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'diagnostic_center_admin') {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin user'
        });
      }
    }

    const center = await DiagnosticCenter.create({
      name,
      description,
      address,
      phone,
      email,
      operatingHours,
      services,
      adminId
    });

    // Update admin's diagnostic center reference if provided
    if (adminId) {
      await User.findByIdAndUpdate(adminId, { diagnosticCenterId: center._id });
    }

    res.status(201).json({
      success: true,
      message: 'Diagnostic center created successfully',
      center
    });
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create diagnostic center',
      error: error.message
    });
  }
};

// Get All Centers
const getAllCenters = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, services } = req.query;
    
    let query = { isActive: true };
    
    // Filter by city
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }
    
    // Filter by services
    if (services) {
      query.services = { $in: services.split(',') };
    }

    const centers = await DiagnosticCenter.find(query)
      .populate('adminId', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await DiagnosticCenter.countDocuments(query);

    res.status(200).json({
      success: true,
      centers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diagnostic centers',
      error: error.message
    });
  }
};

// Get Center by ID
const getCenterById = async (req, res) => {
  try {
    const center = await DiagnosticCenter.findById(req.params.id)
      .populate('adminId', 'name email phone');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic center not found'
      });
    }

    res.status(200).json({
      success: true,
      center
    });
  } catch (error) {
    console.error('Get center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diagnostic center',
      error: error.message
    });
  }
};

// Update Center
const updateCenter = async (req, res) => {
  try {
    const centerId = req.params.id;
    const updates = req.body;

    const center = await DiagnosticCenter.findByIdAndUpdate(
      centerId,
      updates,
      { new: true, runValidators: true }
    ).populate('adminId', 'name email phone');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic center not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnostic center updated successfully',
      center
    });
  } catch (error) {
    console.error('Update center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diagnostic center',
      error: error.message
    });
  }
};

// Delete Center (Soft delete)
const deleteCenter = async (req, res) => {
  try {
    const centerId = req.params.id;

    const center = await DiagnosticCenter.findByIdAndUpdate(
      centerId,
      { isActive: false },
      { new: true }
    );

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic center not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnostic center deleted successfully'
    });
  } catch (error) {
    console.error('Delete center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diagnostic center',
      error: error.message
    });
  }
};

export {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  deleteCenter
};
