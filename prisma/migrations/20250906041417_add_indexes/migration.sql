-- AlterTable
ALTER TABLE `pacientes` MODIFY `nombre` VARCHAR(255) NULL,
    MODIFY `apellido` VARCHAR(255) NULL,
    MODIFY `telefono` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `visitas` MODIFY `padecimiento` TEXT NULL,
    MODIFY `exploracion` TEXT NULL,
    MODIFY `tratamiento_act` TEXT NULL,
    MODIFY `tratamiento_hom` TEXT NULL;

-- CreateIndex
CREATE INDEX `idx_pacientes_nombre` ON `pacientes`(`nombre`);

-- CreateIndex
CREATE INDEX `idx_pacientes_apellido` ON `pacientes`(`apellido`);

-- CreateIndex
CREATE INDEX `idx_pacientes_nombre_apellido` ON `pacientes`(`nombre`, `apellido`);

-- CreateIndex
CREATE INDEX `idx_visitas_fecha` ON `visitas`(`fecha`);
