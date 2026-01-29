const Area = require('../models/Area')
const Dependencia = require('../models/Dependencia')

const listarAreasConDependencias = async (req, res) => {
    const areas = await Area.find().sort({ nombre: 1 }).lean()

    const deps = await Dependencia.find()
        .populate('area', '_id')
        .lean()

    const mapa = {}
    areas.forEach(a => mapa[a._id] = [])

    deps.forEach(d => {
        if (mapa[d.area._id]) {
            mapa[d.area._id].push(d)
        }
    })

    res.render('dashboard/areas', {
        areas,
        dependenciasPorArea: mapa
    })
}

module.exports = { listarAreasConDependencias }
