-- Cursos del Plan de Estudios (Ingeniería de Sistemas UNAB)
INSERT INTO unab.cursos (codigo, nombre, creditos, semestre_plan, tipo, pilar) VALUES
-- Primer Semestre
('IS-101', 'Álgebra lineal', 3, 1, 'plan', NULL),
('IS-102', 'Cálculo diferencial', 4, 1, 'plan', NULL),
('IS-103', 'Expresión', 4, 1, 'plan', NULL),
('IS-104', 'Fundamentos de programación', 3, 1, 'plan', NULL),
('IS-105', 'Seminario de ingeniería I', 2, 1, 'plan', NULL),

-- Segundo Semestre
('IS-201', 'Cálculo integral', 4, 2, 'plan', NULL),
('IS-202', 'Diseño de interfaces de usuario', 3, 2, 'plan', NULL),
('IS-203', 'Identidad', 3, 2, 'plan', NULL),
('IS-204', 'Laboratorio de mecánica', 0, 2, 'plan', NULL),
('IS-205', 'Mecánica y laboratorio', 3, 2, 'plan', NULL),
('IS-206', 'Programación de computadores', 3, 2, 'plan', NULL),
('IS-207', 'Taller de deportes, recreación y cultura', 1, 2, 'plan', NULL),
('IS-208', 'Taller de desarrollo humano', 1, 2, 'plan', NULL),

-- Tercer Semestre
('IS-301', 'Cálculo en varias variables', 3, 3, 'plan', NULL),
('IS-302', 'Creatividad', 3, 3, 'plan', NULL),
('IS-303', 'Electromagnetismo y laboratorio', 3, 3, 'plan', NULL),
('IS-304', 'Estructura de datos y análisis de algoritmos', 3, 3, 'plan', NULL),
('IS-305', 'Laboratorio de electromagnetismo', 0, 3, 'plan', NULL),
('IS-306', 'Matemáticas computacionales', 3, 3, 'plan', NULL),
('IS-307', 'Seminario de ingeniería II', 2, 3, 'plan', NULL),

-- Cuarto Semestre
('IS-401', 'Base de datos I', 3, 4, 'plan', NULL),
('IS-402', 'Desarrollo multimedia', 3, 4, 'plan', NULL),
('IS-403', 'Ecuaciones diferenciales', 3, 4, 'plan', NULL),
('IS-404', 'Estadística general', 3, 4, 'plan', NULL),
('IS-405', 'Inteligencia artificial', 3, 4, 'plan', NULL),
('IS-406', 'Tecnologías móviles', 3, 4, 'plan', NULL),

-- Quinto Semestre
('IS-501', 'Actividades libres de recreación, deporte y cultura y de desarrollo humano', 2, 5, 'plan', NULL),
('IS-502', 'Arquitectura de software', 3, 5, 'plan', NULL),
('IS-503', 'Base de datos II', 3, 5, 'plan', NULL),
('IS-504', 'Electiva de profundización', 3, 5, 'plan', NULL),
('IS-505', 'Infraestructura tecnológica', 3, 5, 'plan', NULL),
('IS-506', 'Ingeniería de software I', 3, 5, 'plan', NULL),

-- Sexto Semestre
('IS-601', 'Ciencias de datos', 3, 6, 'plan', NULL),
('IS-602', 'Electiva de profundización', 3, 6, 'plan', NULL),
('IS-603', 'Ética de la ingeniería de sistemas', 2, 6, 'plan', NULL),
('IS-604', 'Ingeniería de software II', 3, 6, 'plan', NULL),
('IS-605', 'Internet de las cosas', 3, 6, 'plan', NULL),
('IS-606', 'Teoría de sistemas y organizaciones', 3, 6, 'plan', NULL),

-- Séptimo Semestre
('IS-701', 'Ciberseguridad', 3, 7, 'plan', NULL),
('IS-702', 'Electiva sociohumanística', 3, 7, 'plan', NULL),
('IS-703', 'Electiva de contexto', 3, 7, 'plan', NULL),
('IS-704', 'Electiva de profundización', 3, 7, 'plan', NULL),
('IS-705', 'Investigación de operaciones I', 3, 7, 'plan', NULL),
('IS-706', 'Proyectos en ingeniería de sistemas I', 2, 7, 'plan', NULL),

-- Octavo Semestre
('IS-801', 'Dinámica de sistemas', 3, 8, 'plan', NULL),
('IS-802', 'Electiva sociohumanística', 3, 8, 'plan', NULL),
('IS-803', 'Electiva de profundización', 3, 8, 'plan', NULL),
('IS-804', 'Investigación de operaciones II', 3, 8, 'plan', NULL),
('IS-805', 'Proyectos en ingeniería de sistemas II', 4, 8, 'plan', NULL),

-- Noveno Semestre
('IS-901', 'Electiva de contexto', 3, 9, 'plan', NULL),
('IS-902', 'Práctica en ingeniería de sistemas', 12, 9, 'plan', NULL),

-- Competencias Digitales
('CD-101', 'Competencias Digitales Básicas', 0, NULL, 'competencia_digital', 'Básico'),
('CD-201', 'Gestión y Visualización de Datos', 0, NULL, 'competencia_digital', 'Analítica y Contenido Digital'),
('CD-202', 'Creación de Contenido Digital y Multimedia', 0, NULL, 'competencia_digital', 'Analítica y Contenido Digital'),
('CD-203', 'Analítica Web y Estrategia Digital', 0, NULL, 'competencia_digital', 'Analítica y Contenido Digital'),
('CD-301', 'Fundamentos de Inteligencia Artificial Generativa', 0, NULL, 'competencia_digital', 'Tecnologías Transformativas'),
('CD-302', 'Automatización Robótica de Procesos (RPA)', 0, NULL, 'competencia_digital', 'Tecnologías Transformativas'),
('CD-303', 'Transformación Digital y Tecnologías Emergentes', 0, NULL, 'competencia_digital', 'Tecnologías Transformativas');