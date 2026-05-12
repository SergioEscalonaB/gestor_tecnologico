/*
  Warnings:

  - A unique constraint covering the columns `[cedula]` on the table `empleados` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cedula` to the `empleados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "empleados" ADD COLUMN     "cedula" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "empleados_cedula_key" ON "empleados"("cedula");
