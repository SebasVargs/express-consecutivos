const Consecutive = require('../models/Consecutive');

exports.getConsecutives = async (req, res) => {
  try {
    const consecutives = await Consecutive.find()
      .populate('status')
      .populate('user')
      .populate('documents');
    res.status(200).json(consecutives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConsecutiveById = async (req, res) => {
  try {
    const consecutive = await Consecutive.findById(req.params.id)
      .populate('status')
      .populate('user')
      .populate('documents');
    
    if (!consecutive) {
      return res.status(404).json({ error: 'Consecutivo no encontrado' });
    }
    res.status(200).json(consecutive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createConsecutive = async (req, res) => {
  try {
    const consecutive = new Consecutive(req.body);
    await consecutive.save();
    res.status(201).json(consecutive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateConsecutive = async (req, res) => {
  try {
    const consecutive = await Consecutive.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!consecutive) {
      return res.status(404).json({ error: 'Consecutivo no encontrado' });
    }
    res.status(200).json(consecutive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteConsecutive = async (req, res) => {
  try {
    const consecutive = await Consecutive.findByIdAndDelete(req.params.id);
    
    if (!consecutive) {
      return res.status(404).json({ error: 'Consecutivo no encontrado' });
    }
    res.status(200).json({ message: 'Consecutivo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConsecutivesByUser = async (req, res) => {
  try {
    const consecutives = await Consecutive.find({ user: req.params.userId })
      .populate('status')
      .populate('documents');
    
    res.status(200).json(consecutives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};