// Collection: resenas
{
  "_id": ObjectId,
  "calificacion": Number, // 1-5
  "comentario": String,
  "tipo_visita": String, // "familiar", "negocios", "romantica", "amigos", "otro"
  "fecha_resena": Date,
  "platos_consumidos": [String],
  "cliente_id": Number,
  "pedido_id": Number, // optional reference
  "createdAt": Date,
  "updatedAt": Date
}


{
  "_id": ObjectId,
  "cliente_id": Number,
  "intolerancias": [String], // ["lactosa", "gluten", "frutos_secos", etc.]
  "estilos_preferidos": [String], // ["vegetariano", "vegano", "sin_gluten", etc.]
  "platos_favoritos": [String],
  "observaciones": String,
  "ultima_actualizacion": Date,
  "createdAt": Date,
  "updatedAt": Date
}

// Collection: historial_pedidos
{
  "_id": ObjectId,
  "pedido_id": Number,
  "cliente_id": Number,
  "detalles_platos": [{
    "nombre_plato": String,
    "cantidad": Number,
    "precio_unitario": Number,
    "observaciones": String
  }],
  "fecha_pedido": Date,
  "total": Number,
  "estado": String,
  "mesa_id": Number,
  "tipo_pedido": String,
  "createdAt": Date,
  "updatedAt": Date
}

// Collection: recomendaciones
{
  "_id": ObjectId,
  "cliente_id": Number,
  "recomendaciones": [{
    "plato_id": Number,
    "nombre_plato": String,
    "razon": String,
    "score": Number // 0-1
  }],
  "fecha_generacion": Date,
  "algoritmo_usado": String,
  "createdAt": Date,
  "updatedAt": Date
}
