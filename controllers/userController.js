const mongoose = require('mongoose');
const User = require('../models/User.js');
const Role = require('../models/Rol.js');

// Obtener todos los usuarios con el rol y status poblados
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('id_rol').populate('status');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un usuario por su ID con el rol y status poblados
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('id_rol').populate('status');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    console.log('Body recibido:', req.body);

    // Convertir a ObjectId si no lo es
    const roleId = mongoose.Types.ObjectId.isValid(req.body.id_rol)
      ? new mongoose.Types.ObjectId(req.body.id_rol)
      : null;

    if (!roleId) {
      return res.status(400).json({ error: 'ID de rol no válido' });
    }

    const role = await Role.findById(roleId);
    console.log('Rol encontrado:', role);

    if (!role) {
      return res.status(400).json({ error: 'Rol no encontrado' });
    }

    const user = new User({
      ...req.body,
      id_rol: role._id
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    // Verifica si el id_rol necesita ser convertido a ObjectId
    if (req.body.id_rol) {
      const role = await Role.findOne({ id: req.body.id_rol }).select('_id');
      if (role) {
        req.body.id_rol = role._id;  // Actualiza id_rol con el ObjectId
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('id_rol').populate('status');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un usuario por su KeycloakId
exports.getUserByKeycloakId = async (req, res) => {
  try {
    const user = await User.findOne({ keycloakId: req.params.keycloakId }).populate('id_rol').populate('status');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
