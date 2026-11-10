-- Mensalidade paga vira entrada no Financeiro: cada pagamento registrado gera uma Transaction
-- vinculada, removida quando o pagamento é desfeito.
-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `paymentId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_paymentId_key` ON `Transaction`(`paymentId`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: mensalidades já marcadas como pagas antes desta mudança passam a contar no Financeiro
INSERT INTO `Transaction` (`date`, `description`, `kind`, `category`, `amountCents`, `paymentId`, `createdAt`)
SELECT p.`paidAt`, CONCAT('Mensalidade ', SUBSTRING(p.`reference`, 6, 2), '/', SUBSTRING(p.`reference`, 1, 4), ' · ', s.`shortName`),
       'entrada', 'Mensalidades', p.`amountCents`, p.`id`, CURRENT_TIMESTAMP(3)
FROM `Payment` p
JOIN `Student` s ON s.`id` = p.`studentId`
WHERE p.`paidAt` IS NOT NULL;
