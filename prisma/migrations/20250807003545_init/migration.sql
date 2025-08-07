-- CreateTable
CREATE TABLE `pacientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(45) NULL,
    `apellido` VARCHAR(45) NULL,
    `fecha_nacimiento` DATE NULL,
    `telefono` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitas` (
    `idvisitas` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATE NULL,
    `padecimiento` VARCHAR(600) NULL,
    `exploracion` VARCHAR(500) NULL,
    `tratamiento_act` VARCHAR(255) NULL,
    `tratamiento_hom` VARCHAR(255) NULL,
    `paciente_id` INTEGER NOT NULL,

    INDEX `visitas_paciente_id_fkey`(`paciente_id`),
    PRIMARY KEY (`idvisitas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `visitas` ADD CONSTRAINT `visitas_paciente_id_fkey` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
