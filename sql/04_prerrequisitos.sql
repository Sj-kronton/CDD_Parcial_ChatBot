-- ============================================================================
-- 1. INSERCIÓN DE PRERREQUISITOS EN unab.prerrequisitos
-- ============================================================================
INSERT INTO unab.prerrequisitos (codigo_curso, codigo_requisito) VALUES
-- Regla 1: Continuaciones explícitas (I -> II)
('IS-307', 'IS-105'), -- Seminario de ingeniería II -> Seminario de ingeniería I
('IS-503', 'IS-401'), -- Base de datos II -> Base de datos I
('IS-604', 'IS-506'), -- Ingeniería de software II -> Ingeniería de software I
('IS-804', 'IS-705'), -- Investigación de operaciones II -> Investigación de operaciones I
('IS-805', 'IS-706'), -- Proyectos en ingeniería de sistemas II -> Proyectos en ingeniería de sistemas I

-- Regla 2: Prerrequisitos lógicos por línea de conocimiento
-- Línea de Ciencias Básicas (Matemáticas y Física)
('IS-201', 'IS-102'), -- Cálculo integral -> Cálculo diferencial
('IS-301', 'IS-201'), -- Cálculo en varias variables -> Cálculo integral
('IS-403', 'IS-201'), -- Ecuaciones diferenciales -> Cálculo integral
('IS-404', 'IS-201'), -- Estadística general -> Cálculo integral
('IS-303', 'IS-205'), -- Electromagnetismo y laboratorio -> Mecánica y laboratorio
('IS-303', 'IS-201'), -- Electromagnetismo y laboratorio -> Cálculo integral
('IS-306', 'IS-101'), -- Matemáticas computacionales -> Álgebra lineal

-- Línea de Programación e Ingeniería de Software
('IS-206', 'IS-104'), -- Programación de computadores -> Fundamentos de programación
('IS-304', 'IS-206'), -- Estructura de datos y análisis de algoritmos -> Programación de computadores
('IS-402', 'IS-202'), -- Desarrollo multimedia -> Diseño de interfaces de usuario
('IS-406', 'IS-206'), -- Tecnologías móviles -> Programación de computadores
('IS-506', 'IS-304'), -- Ingeniería de software I -> Estructura de datos y análisis de algoritmos

-- Línea de Datos, IA y Modelado
('IS-401', 'IS-304'), -- Base de datos I -> Estructura de datos y análisis de algoritmos
('IS-405', 'IS-304'), -- Inteligencia artificial -> Estructura de datos y análisis de algoritmos
('IS-405', 'IS-306'), -- Inteligencia artificial -> Matemáticas computacionales
('IS-601', 'IS-503'), -- Ciencias de datos -> Base de datos II
('IS-601', 'IS-404'), -- Ciencias de datos -> Estadística general
('IS-801', 'IS-403'), -- Dinámica de sistemas -> Ecuaciones diferenciales
('IS-801', 'IS-606'), -- Dinámica de sistemas -> Teoría de sistemas y organizaciones

-- Línea de Infraestructura, Redes y Cierre
('IS-605', 'IS-505'), -- Internet de las cosas -> Infraestructura tecnológica
('IS-701', 'IS-505'), -- Ciberseguridad -> Infraestructura tecnológica
('IS-706', 'IS-604'), -- Proyectos en ingeniería de sistemas I -> Ingeniería de software II
('IS-902', 'IS-805'); -- Práctica en ingeniería de sistemas -> Proyectos en ingeniería de sistemas II


-- ============================================================================
-- 2. VALIDACIÓN DE NOTA MÍNIMA (>= 3.0) AL MATRICULAR (Opcional / Recomendado)
-- ============================================================================
-- Nota: Ajusta el nombre de la tabla de matrículas/historial (ej. unab.matriculas)
-- y sus columnas (id_estudiante, codigo_curso, nota, estado) según tu esquema.

CREATE OR REPLACE FUNCTION unab.validar_prerrequisitos_matricula()
RETURNS TRIGGER AS $$
DECLARE
    v_faltantes TEXT;
BEGIN
    -- Busca si existe algún prerrequisito del curso que el estudiante NO haya aprobado con >= 3.0
    SELECT string_agg(p.codigo_requisito, ', ')
    INTO v_faltantes
    FROM unab.prerrequisitos p
    WHERE p.codigo_curso = NEW.codigo_curso
      AND NOT EXISTS (
          SELECT 1
          FROM unab.matriculas m
          WHERE m.id_estudiante = NEW.id_estudiante
            AND m.codigo_curso = p.codigo_requisito
            AND m.nota >= 3.0
            -- Opcional: AND m.estado = 'aprobada'
      );

    IF v_faltantes IS NOT NULL THEN
        RAISE EXCEPTION 'El estudiante % no cumple con los prerrequisitos aprobados (nota >= 3.0) para %: faltan [%]',
            NEW.id_estudiante, NEW.codigo_curso, v_faltantes;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;