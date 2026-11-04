-- AlterTable
ALTER TABLE `Student` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedById` INTEGER NULL,
    ADD COLUMN `cpf` CHAR(11) NULL,
    ADD COLUMN `guardianCpf` CHAR(11) NULL;

-- CreateTable
CREATE TABLE `TermAcceptance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `signerRole` VARCHAR(191) NOT NULL,
    `signerName` VARCHAR(191) NOT NULL,
    `signerCpf` CHAR(11) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `userAgent` VARCHAR(500) NULL,
    `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TermAcceptance_studentId_acceptedAt_idx`(`studentId`, `acceptedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Student_cpf_key` ON `Student`(`cpf`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermAcceptance` ADD CONSTRAINT `TermAcceptance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

