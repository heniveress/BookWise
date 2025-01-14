SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `konyvek` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `cim` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `szerzo_id` int DEFAULT NULL,
  `kiado` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `mufaj_id` int DEFAULT NULL,
  `leiras` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci,
  `ar` float DEFAULT '0',
  `boritokep_id` int DEFAULT NULL,
  `kiadas_datuma` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


CREATE TABLE `boritokepek` (
  `id` int NOT NULL,
  `nev` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci NOT NULL DEFAULT '''''',
  `mime` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `hossz` int DEFAULT NULL,
  `data` mediumblob,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


CREATE TABLE `mufajok` (
  `id` int NOT NULL,
  `nev` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;



CREATE TABLE `szerzok` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `nev` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `szulev` date DEFAULT NULL,
  `nemzetiseg` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `eletben` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(200) NOT NULL,
  `password` char(40) NOT NULL,
  `role` enum('user','admin','guest') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'user',
  `hashcode` varchar(40) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


ALTER TABLE `konyvek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id` (`user_id`),
  ADD KEY `fk_szerzo_id` (`szerzo_id`),
  ADD KEY `fk_mufaj_id` (`mufaj_id`),
  ADD KEY `fk_boritokep_id` (`boritokep_id`);
ALTER TABLE `konyvek` ADD FULLTEXT KEY `szoveg` (`cim`,`leiras`);


ALTER TABLE `boritokepek`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `szerzok`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `mufajok`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);


ALTER TABLE `konyvek`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;


ALTER TABLE `boritokepek`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;


ALTER TABLE `szerzok`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

ALTER TABLE `mufajok`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;


ALTER TABLE `konyvek`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_szerzo` FOREIGN KEY (`szerzo_id`) REFERENCES `szerzok` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_kepek` FOREIGN KEY (`boritokep_id`) REFERENCES `boritokepek` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mufaj` FOREIGN KEY (`mufaj_id`) REFERENCES `mufajok` (`id`);


COMMIT;