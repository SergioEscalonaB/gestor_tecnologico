/*
  Warnings:

  - You are about to drop the column `activo_id` on the `asignaciones` table. All the data in the column will be lost.
  - You are about to drop the column `empleado_id` on the `asignaciones` table. All the data in the column will be lost.
  - You are about to drop the column `activo_id` on the `mantenimientos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `mantenimientos` table. All the data in the column will be lost.
  - You are about to drop the column `tecnico` on the `mantenimientos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activoId,fecha_fin]` on the table `asignaciones` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activoId` to the `asignaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empleadoId` to the `asignaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activoId` to the `mantenimientos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activo_nombre` to the `mantenimientos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `mantenimientos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_programada` to the `mantenimientos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsable` to the `mantenimientos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "asignaciones" DROP CONSTRAINT "asignaciones_activo_id_fkey";

-- DropForeignKey
ALTER TABLE "asignaciones" DROP CONSTRAINT "asignaciones_empleado_id_fkey";

-- DropForeignKey
ALTER TABLE "mantenimientos" DROP CONSTRAINT "mantenimientos_activo_id_fkey";

-- DropIndex
DROP INDEX "asignaciones_activo_id_fecha_fin_key";

-- DropIndex
DROP INDEX "asignaciones_activo_id_idx";

-- DropIndex
DROP INDEX "asignaciones_empleado_id_idx";

-- DropIndex
DROP INDEX "mantenimientos_activo_id_idx";

-- DropIndex
DROP INDEX "mantenimientos_fecha_idx";

-- AlterTable
ALTER TABLE "activos" ADD COLUMN     "empleadoResponsableId" INTEGER,
ADD COLUMN     "proveedor" TEXT,
ADD COLUMN     "ubicacion" TEXT,
ADD COLUMN     "valor_compra" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "asignaciones" DROP COLUMN "activo_id",
DROP COLUMN "empleado_id",
ADD COLUMN     "activoId" INTEGER NOT NULL,
ADD COLUMN     "empleadoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "mantenimientos" DROP COLUMN "activo_id",
DROP COLUMN "fecha",
DROP COLUMN "tecnico",
ADD COLUMN     "activoId" INTEGER NOT NULL,
ADD COLUMN     "activo_nombre" TEXT NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "fecha_programada" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "responsable" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "asignaciones_activoId_idx" ON "asignaciones"("activoId");

-- CreateIndex
CREATE INDEX "asignaciones_empleadoId_idx" ON "asignaciones"("empleadoId");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_activoId_fecha_fin_key" ON "asignaciones"("activoId", "fecha_fin");

-- CreateIndex
CREATE INDEX "mantenimientos_activoId_idx" ON "mantenimientos"("activoId");

-- CreateIndex
CREATE INDEX "mantenimientos_fecha_programada_idx" ON "mantenimientos"("fecha_programada");

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_empleadoResponsableId_fkey" FOREIGN KEY ("empleadoResponsableId") REFERENCES "empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
