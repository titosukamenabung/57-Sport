-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_pembicara_id_fkey`;

-- DropIndex
DROP INDEX `events_category_id_fkey` ON `events`;

-- DropIndex
DROP INDEX `events_pembicara_id_fkey` ON `events`;
