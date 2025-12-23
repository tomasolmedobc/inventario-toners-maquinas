const Auditoria = require('../models/Auditoria');

module.exports = async function registrarAuditoria({
  accion,
  modulo,
  referencia,
  referenciaModelo,
  descripcion,
  usuario
}) {
  try {
    await Auditoria.create({
      accion,
      modulo,
      referencia,
      referenciaModelo,
      descripcion,
      usuario
    });
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
};
