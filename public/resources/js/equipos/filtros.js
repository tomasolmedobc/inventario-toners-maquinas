/**
 * Gestiona la lógica de selects dependientes (cascada) y filtros
 */
export const FiltroManager = {
    // Guarda la referencia de todas las áreas y dependencias de la DB
    dataMaestra: { areas: [], dependencias: [] },

    /**
     * Inicializa los datos maestros
     */
    setDatos(areas, dependencias) {
        this.dataMaestra.areas = areas;
        this.dataMaestra.dependencias = dependencias;
    },

    /**
     * Puebla un select con una lista de ítems
     */
    poblarSelect(select, lista, placeholder = "Seleccionar") {
        if (!select) return;
        select.innerHTML = `<option value="">${placeholder}</option>`;
        lista.forEach(item => {
            const option = new Option(item.nombre, item._id);
            select.append(option);
        });
    },

    /**
     * Maneja la cascada: al cambiar área, actualiza dependencias
     * @param {string} areaId 
     * @param {HTMLElement} selectDep - El select de dependencias a actualizar
     * @param {string} placeholder 
     */
    configurarCascada(areaId, selectDep, placeholder = "Todas las dependencias") {
        // Si no hay areaId, la lista filtrada es vacía
        const filtradas = areaId 
            ? this.dataMaestra.dependencias.filter(d => (d.area._id || d.area) === areaId)
            : [];
        
        this.poblarSelect(selectDep, filtradas, placeholder);
        
        if (selectDep) {
            // Si no hay área, deshabilitamos el select de dependencia
            selectDep.disabled = !areaId;
            // Importante: Refrescar Select2
            $(selectDep).trigger('change'); 
        }
    },

    /**
     * Aplica el filtro lógico sobre el array de equipos
     */
    aplicarFiltro(equipos, { texto, area, dependencia, areaIdFn, depIdFn, areaNombreFn, depNombreFn }) {
        return equipos.filter(e => {
            const matchArea = !area || areaIdFn(e) === area;
            const matchDep = !dependencia || depIdFn(e) === dependencia;
            const matchTexto = !texto || [
                areaNombreFn(e), 
                depNombreFn(e), 
                e.usernamePc, 
                e.codigoIdentificacion
            ].some(v => v?.toLowerCase().includes(texto.toLowerCase()));

            return matchArea && matchDep && matchTexto;
        });
    }
};