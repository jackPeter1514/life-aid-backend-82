import DiagnosticTest from '../models/DiagnosticTest.js';

// Create Diagnostic Test
const createTest = async (req, res) => {
  try {
    const { name, description, category, price, duration, preparationInstructions, requirements } = req.body;
    let diagnosticCenterId;

    // Determine diagnostic center based on user role
    if (req.user.role === 'admin') {
      diagnosticCenterId = req.body.diagnosticCenterId;
    } else if (req.user.role === 'diagnostic_center_admin') {
      diagnosticCenterId = req.user.diagnosticCenterId;
    }

    const test = await DiagnosticTest.create({
      name,
      description,
      category,
      price,
      duration,
      preparationInstructions,
      requirements,
      diagnosticCenterId
    });

    res.status(201).json({
      success: true,
      message: 'Diagnostic test created successfully',
      test
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create diagnostic test',
      error: error.message
    });
  }
};

// Get Tests by Center
const getTestsByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { category, priceRange } = req.query;

    let query = { diagnosticCenterId: centerId, isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      query.price = { $gte: min, $lte: max };
    }

    const tests = await DiagnosticTest.find(query)
      .populate('diagnosticCenterId', 'name address')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      tests
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diagnostic tests',
      error: error.message
    });
  }
};

// Get All Tests
const getAllTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Search by name
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const tests = await DiagnosticTest.find(query)
      .populate('diagnosticCenterId', 'name address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await DiagnosticTest.countDocuments(query);

    res.status(200).json({
      success: true,
      tests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diagnostic tests',
      error: error.message
    });
  }
};

// Update Test
const updateTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const updates = req.body;

    const test = await DiagnosticTest.findByIdAndUpdate(
      testId,
      updates,
      { new: true, runValidators: true }
    ).populate('diagnosticCenterId', 'name address');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnostic test updated successfully',
      test
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diagnostic test',
      error: error.message
    });
  }
};

// Delete Test
const deleteTest = async (req, res) => {
  try {
    const testId = req.params.id;

    const test = await DiagnosticTest.findByIdAndUpdate(
      testId,
      { isActive: false },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnostic test deleted successfully'
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diagnostic test',
      error: error.message
    });
  }
};

export {
  createTest,
  getTestsByCenter,
  getAllTests,
  updateTest,
  deleteTest
};
