# Scripts de migración

Scripts de uso puntual para normalizar datos existentes en la base. No forman parte del flujo normal de la app y no se ejecutan automáticamente en ningún momento (no están referenciados desde `server.js` ni desde ningún `package.json` script).

**No correr contra la base de producción sin hacer un backup antes** — ambos modifican y/o eliminan documentos de forma directa e irreversible.

## unificarMarca.js
Agrupa productos por `tipo + modelo` y normaliza la capitalización de `marca` (ej: "mgn" → "Mgn") en los documentos existentes.

## unificarTipos.js
Agrupa productos por `tipo`, fusiona los duplicados en uno solo (suma `cantidad`, reasigna los `Movimiento` asociados al producto que queda) y **elimina** los productos duplicados sobrantes.

## Cómo correrlos
```
node script/unificarMarca.js
node script/unificarTipos.js
```
