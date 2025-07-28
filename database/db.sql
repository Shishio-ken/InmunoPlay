create database SistemaEducativo;

use SistemaEducativo;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'administrador') DEFAULT 'estudiante'
);

-- Tabla de leucemias (información morfológica)
CREATE TABLE leucemias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('mieloide', 'linfoide') NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255)
);

-- Tabla de juegos interactivos (opcional)
CREATE TABLE juegos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    url_recurso VARCHAR(255)
);

-- Tabla de preguntas
CREATE TABLE preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enunciado TEXT NOT NULL,
    id_leucemia INT,
    FOREIGN KEY (id_leucemia) REFERENCES leucemias(id) ON DELETE SET NULL
);

-- Tabla de opciones para cada pregunta
CREATE TABLE opciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pregunta INT,
    texto_opcion TEXT NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas(id) ON DELETE CASCADE
);

-- Tabla de resultados de autoevaluaciones
CREATE TABLE resultados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puntaje INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Progreso del estudiante por módulo o sección (opcional)
CREATE TABLE progreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    modulo VARCHAR(100),
    completado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);



CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabla_afectada VARCHAR(50),
    accion VARCHAR(10), -- 'INSERT', 'UPDATE', 'DELETE'
    usuario_afectado INT, -- puede ser NULL si no aplica
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Triger Insert

DELIMITER $$
CREATE TRIGGER aud_usuarios_insert
AFTER INSERT ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla_afectada, accion, usuario_afectado, datos_nuevos)
    VALUES ('usuarios', 'INSERT', NEW.id, CONCAT('username: ', NEW.username, ', correo: ', NEW.correo));
END$$
DELIMITER ;




-- Triger Update

DELIMITER $$
CREATE TRIGGER aud_usuarios_update
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla_afectada, accion, usuario_afectado, datos_anteriores, datos_nuevos)
    VALUES (
        'usuarios',
        'UPDATE',
        NEW.id,
        CONCAT('username: ', OLD.username, ', correo: ', OLD.correo),
        CONCAT('username: ', NEW.username, ', correo: ', NEW.correo)
    );
END$$
DELIMITER ;





-- Triger Delete


DELIMITER $$
CREATE TRIGGER aud_usuarios_delete
AFTER DELETE ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla_afectada, accion, usuario_afectado, datos_anteriores)
    VALUES ('usuarios', 'DELETE', OLD.id, CONCAT('username: ', OLD.username, ', correo: ', OLD.correo));
END$$
DELIMITER ;
