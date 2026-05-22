-- 1. Tabla de Empresas Clientes (Mandantes)
CREATE TABLE mandantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_empresa VARCHAR(255) NOT NULL,
    creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Encuestadores
--    Soft-delete: nunca se borran físicamente para preservar trazabilidad histórica.
CREATE TABLE encuestadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mandante_id UUID REFERENCES mandantes(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
    -- Sin ON DELETE CASCADE: se desactiva con activo=FALSE, nunca se borra.
);

-- 3. Tabla Maestra de Encuestas
CREATE TABLE encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mandante_id UUID REFERENCES mandantes(id) ON DELETE CASCADE,
    objetivo_negocio TEXT NOT NULL,
    estructura_json JSONB NOT NULL,
    creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Respuestas Cabecera
--    FIX: agrega es_descarte y pregunta_descarte_id para trazabilidad de funnel.
--    FIX: encuestador_id usa RESTRICT en lugar de SET NULL para evitar huérfanos de identidad.
CREATE TABLE respuestas_cabecera (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    encuestador_id UUID REFERENCES encuestadores(id) ON DELETE RESTRICT,
    fecha_captura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    es_descarte BOOLEAN NOT NULL DEFAULT FALSE,
    pregunta_descarte_id INT NULL -- Qué pregunta generó el descarte (análisis de funnel)
);

-- 5. Tabla de Respuestas Detalle
--    FIX: agrega encuesta_id para poder validar que pregunta_id pertenece a esa encuesta.
--    FIX: pregunta_id referenciado lógicamente via encuesta_id + estructura_json (no FK directa
--         porque las preguntas viven en JSONB, pero encuesta_id permite validación en aplicación).
CREATE TABLE respuestas_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cabecera_id UUID NOT NULL REFERENCES respuestas_cabecera(id) ON DELETE CASCADE,
    encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    pregunta_id INT NOT NULL,
    valor_respondido TEXT NOT NULL,
    -- Garantiza que no se inserten duplicados para la misma pregunta en la misma respuesta
    UNIQUE (cabecera_id, pregunta_id)
);

-- Índices de consulta frecuente
CREATE INDEX idx_cabecera_encuesta ON respuestas_cabecera(encuesta_id);
CREATE INDEX idx_cabecera_encuestador ON respuestas_cabecera(encuestador_id);
CREATE INDEX idx_detalle_cabecera ON respuestas_detalle(cabecera_id);
CREATE INDEX idx_detalle_encuesta ON respuestas_detalle(encuesta_id);
