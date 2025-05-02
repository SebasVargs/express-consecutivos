const Rol = require('../models/Rol.js');
const User = require('../models/User.js');

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Rol.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un rol por ID
exports.getRolById = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.status(200).json(rol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un rol
exports.createRol = async (req, res) => {
  try {
    const rol = new Rol(req.body);
    await rol.save();
    res.status(201).json(rol);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRol = async (req, res) => {
  try {
    const rol = await Rol.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.status(200).json(rol);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un rol
exports.deleteRol = async (req, res) => {
  try {
    const usersWithRol = await User.countDocuments({ rol: req.params.id });
    if (usersWithRol > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el rol porque está asignado a uno o más usuarios',
        count: usersWithRol
      });
    }
    const rol = await Rol.findByIdAndDelete(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.status(200).json({ message: 'Rol eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};