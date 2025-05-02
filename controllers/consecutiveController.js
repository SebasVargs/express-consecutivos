const Consecutive = require('../models/Consecutive.js');

// Obtener todos los consecutivos
exports.getConsecutives = async (req, res) => {
  try {
    const consecutives = await Consecutive.find()
      .populate('id_user')
      .populate('id_status');
    res.status(200).json(consecutives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener consecutivo por ID
exports.getConsecutiveById = async (req, res) => {
  try {
    const consecutive = await Consecutive.findById(req.params.id)
      .populate('id_user')
      .populate('id_status');

    if (!consecutive) {
      return res.status(404).json({ error: 'Consecutivo no encontrado' });
    }

    res.status(200).json(consecutive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo consecutivo
exports.createConsecutive = async (req, res) => {
  try {
    const consecutive = new Consecutive(req.body);
    await consecutive.save();
    res.status(201).json(consecutive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un consecutivo
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

// Eliminar un consecutivo
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

// Obtener consecutivos por ID de usuario
exports.getConsecutivesByUser = async (req, res) => {
  try {
    const consecutives = await Consecutive.find({ id_user: req.params.userId })
      .populate('id_status');

    res.status(200).json(consecutives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
