-- Workshop Management System Database Schema

-- Disable foreign key checks for dropping tables cleanly
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `checkins`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `workshops`;
DROP TABLE IF EXISTS `participants`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `refresh_tokens`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Refresh Tokens (Used for auth sessions)
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `refresh_token` varchar(512) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Users (Admin, Staff, Viewer)
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','STAFF','VIEWER') NOT NULL DEFAULT 'STAFF',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `refresh_token_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_refresh_token` (`refresh_token_id`),
  CONSTRAINT `fk_users_refresh_token` FOREIGN KEY (`refresh_token_id`) REFERENCES `refresh_tokens` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Participants
CREATE TABLE `participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_participant_email` (`email`),
  KEY `idx_participant_mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Workshops
CREATE TABLE `workshops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `banner_image` varchar(255) DEFAULT NULL,
  `venue` varchar(255) NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `registration_start` datetime DEFAULT NULL,
  `registration_end` datetime DEFAULT NULL,
  `capacity` int NOT NULL,
  `status` enum('DRAFT','OPEN','CLOSED','CANCELLED') DEFAULT 'DRAFT',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workshop_status` (`status`),
  KEY `idx_workshop_start` (`start_datetime`),
  KEY `idx_workshop_creator` (`created_by`),
  CONSTRAINT `fk_workshop_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `workshops_chk_1` CHECK ((`capacity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Registrations (Linking participants to workshops)
CREATE TABLE `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `participant_id` int NOT NULL,
  `workshop_id` int NOT NULL,
  `registration_code` varchar(30) NOT NULL,
  `status` enum('REGISTERED','WAITLISTED','CANCELLED') DEFAULT 'REGISTERED',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_code` (`registration_code`),
  UNIQUE KEY `uq_registration` (`participant_id`,`workshop_id`),
  KEY `idx_registration_workshop` (`workshop_id`),
  KEY `idx_registration_participant` (`participant_id`),
  KEY `idx_registration_code` (`registration_code`),
  CONSTRAINT `fk_registration_participant` FOREIGN KEY (`participant_id`) REFERENCES `participants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_registration_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Announcements (Workshop updates)
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workshop_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_announcement_workshop` (`workshop_id`),
  KEY `fk_announcement_user` (`created_by`),
  CONSTRAINT `fk_announcement_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_announcement_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Checkins (Event day attendance)
CREATE TABLE `checkins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `checked_in_by` int NOT NULL,
  `checked_in_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `checked_out_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_id` (`registration_id`),
  KEY `fk_checkin_user` (`checked_in_by`),
  CONSTRAINT `fk_checkin_registration` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_checkin_user` FOREIGN KEY (`checked_in_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
