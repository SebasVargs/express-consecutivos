const Status = require('../models/Status.js');
const Consecutive = require('../models/Consecutive.js');

exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find().sort({ name: 1 });
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStatusById = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un estado
exports.createStatus = async (req, res) => {
  try {
    const status = new Status(req.body);
    await status.save();
    res.status(201).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const status = await Status.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!status) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }
    res.status(200).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.deleteStatus = async (req, res) => {
  try {
    const used = await Consecutive.countDocuments({ id_status: req.params.id });
    if (used > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el estado porque está asociado a consecutivos',
        count: used
      });
    }
    const status = await Status.findByIdAndDelete(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }
    res.status(200).json({ message: 'Estado eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};