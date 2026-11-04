-- AlterTable
ALTER TABLE `Plan` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isKids` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;


-- Planos já existentes: Kids vira plano infantil e a ordem segue a criação
UPDATE `Plan` SET `isKids` = true WHERE `name` = 'Kids';
UPDATE `Plan` SET `position` = `id`;
