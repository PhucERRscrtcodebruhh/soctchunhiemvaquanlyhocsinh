-- =========================================================================
-- DATABASE SCHEMA: MULTI-TENANT STATE PERSISTENCE (WORD & EXCEL MODULES)
-- Trực thuộc Hệ thống Sổ Công Tác Chủ Nhiệm và Quản Lý Học Sinh (THPT Phù Cừ)
-- =========================================================================

-- 1. Bảng danh mục Lớp học (Classes Table)
CREATE TABLE IF NOT EXISTS `classes` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY, -- e.g., '10A1', '12A7'
    `class_name` VARCHAR(100) NOT NULL,
    `academic_year` VARCHAR(20) DEFAULT '2025-2026',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Kho lưu trữ tài liệu & bảng tính chuẩn cho cả 12 phân hệ (Generic Document & Spreadsheet Store)
CREATE TABLE IF NOT EXISTS `class_module_documents` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `class_id` VARCHAR(50) NOT NULL,
    `module_key` VARCHAR(100) NOT NULL, -- e.g., 'so_yeu_ly_lich', 'thong_tu_22', 'ban_dai_dien_cha_me', 'thoi_khoa_bieu'
    `doc_type` ENUM('EXCEL', 'WORD') NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    -- Store structured editor payload (JSON representation of cell matrix / TipTap HTML / JSON)
    `content_json` LONGTEXT NULL,
    -- Fallback/Export cache: Raw binary buffer encoded in Base64
    `file_blob_base64` LONGTEXT NULL,
    `version` INT DEFAULT 1,
    `updated_by` VARCHAR(100) NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_class_module` (`class_id`, `module_key`),
    CONSTRAINT `fk_module_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng chuẩn hóa Hồ sơ học sinh (Normalized Student Records - Synced automatically from 'Sơ yếu lý lịch' Excel)
CREATE TABLE IF NOT EXISTS `students` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `class_id` VARCHAR(50) NOT NULL,
    `stt` INT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `dob` VARCHAR(50) NULL,
    `gender` ENUM('Nam', 'Nữ', 'Khác') DEFAULT 'Nam',
    `parent_name` VARCHAR(150) NULL,
    `parent_phone` VARCHAR(30) NULL,
    `address` VARCHAR(255) NULL,
    `team_group` VARCHAR(50) NULL, -- 'Tổ 1', 'Tổ 2', etc.
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_student_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
