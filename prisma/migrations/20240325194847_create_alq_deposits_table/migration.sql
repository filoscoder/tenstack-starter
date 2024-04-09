-- CreateTable
CREATE TABLE `ALQ_DEPOSITS` (
    `id_transaccion` INTEGER NOT NULL,
    `tipo_transaccion` INTEGER NOT NULL,
    `id_cuenta_ahorro` INTEGER NOT NULL,
    `id_medio_pago` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `tipo_movimiento` INTEGER NOT NULL,
    `tipo_cargo` INTEGER NOT NULL,
    `tipo_operacion` INTEGER NOT NULL,
    `fecha_alta` DATETIME(3) NOT NULL,
    `fecha_actualizacion` DATETIME(3) NOT NULL,
    `concepto` VARCHAR(191) NOT NULL,
    `estatus_transaccion` INTEGER NOT NULL,
    `clave_rastreo` VARCHAR(191) NOT NULL,
    `id_cuenta_ahorro_medio_pago` INTEGER NOT NULL,
    `fecha_operacion` DATETIME(3) NOT NULL,
    `monto` VARCHAR(191) NOT NULL,
    `valor_real` DOUBLE NOT NULL,

    PRIMARY KEY (`id_transaccion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
