-- CreateTable
CREATE TABLE `Channel_Purpose` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `discord_id` VARCHAR(255) NOT NULL,
    `channel_type` INTEGER NOT NULL,
    `server_id` INTEGER NOT NULL,
    `guild_id` INTEGER NULL,

    UNIQUE INDEX `uc_channel_purpose`(`channel_type`, `server_id`, `guild_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Channel_Purpose_Type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guild_Application` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` LONGTEXT NOT NULL,
    `server_id` INTEGER NOT NULL,
    `game_id` INTEGER NOT NULL,

    UNIQUE INDEX `uc_guild_application`(`server_id`, `game_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Channel_Purpose` ADD CONSTRAINT `channel_purpose_type_fk` FOREIGN KEY (`channel_type`) REFERENCES `Channel_Purpose_Type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Channel_Purpose` ADD CONSTRAINT `channel_purpose_server_fk` FOREIGN KEY (`server_id`) REFERENCES `Server`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Channel_Purpose` ADD CONSTRAINT `channel_purpose_guild_fk` FOREIGN KEY (`guild_id`) REFERENCES `Guild`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Guild_Applicant` ADD CONSTRAINT `guild_applicant_game_fk` FOREIGN KEY (`game_id`) REFERENCES `Game`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Guild_Application` ADD CONSTRAINT `guild_application_server_fk` FOREIGN KEY (`server_id`) REFERENCES `Server`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Guild_Application` ADD CONSTRAINT `guild_application_game_fk` FOREIGN KEY (`game_id`) REFERENCES `Game`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
