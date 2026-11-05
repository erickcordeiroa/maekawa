-- Telefone deixa de ser único e passa a ser opcional:
-- uma família pode usar o mesmo número (filhos com o telefone do pai) e menor pode não ter telefone.
-- DropIndex
DROP INDEX `Student_phone_key` ON `Student`;

-- AlterTable
ALTER TABLE `Student` MODIFY `phone` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Student_phone_idx` ON `Student`(`phone`);

-- CreateIndex
CREATE INDEX `Student_guardianPhone_idx` ON `Student`(`guardianPhone`);

-- CreateIndex (evita matrícula em dobro de quem não tem CPF)
CREATE INDEX `Student_fullName_birthDate_idx` ON `Student`(`fullName`, `birthDate`);
