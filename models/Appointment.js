import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosticCenterId: {
    type: String,
    required: true,
    trim: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticTest',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true
  },
  results: {
    reportUrl: String,
    summary: String,
    uploadedAt: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ diagnosticCenterId: 1, appointmentDate: 1 });

export default mongoose.model('Appointment', appointmentSchema);
