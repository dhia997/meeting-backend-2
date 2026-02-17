require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Interview Schema
const interviewSchema = new mongoose.Schema({
  date: String,
  time: String,
  meeting_link: String,
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

const Interview = mongoose.model('Interview', interviewSchema);

// ===== ROUTES =====

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚀 API Running!' });
});

// GET all interviews
app.get('/api/interviews', async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ created_at: -1 });
    res.json({ success: true, interviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create interview
app.post('/api/interviews', async (req, res) => {
  try {
    const { date, time } = req.body;
    const meeting_link = `https://meet.jit.si/Meeting-${Date.now()}`;
    
    const interview = new Interview({ date, time, meeting_link });
    await interview.save();
    
    res.status(201).json({ success: true, interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT accept
app.put('/api/interviews/:id/accept', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { new: true }
    );
    res.json({ success: true, interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT decline
app.put('/api/interviews/:id/decline', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status: 'declined' },
      { new: true }
    );
    res.json({ success: true, interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE interview
app.delete('/api/interviews/:id', async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});