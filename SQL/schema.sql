DROP DATABASE IF EXISTS chat;
CREATE DATABASE chat;

USE chat;

-- CREATE TABLE messages (
--   Describe your table here.
-- );

/* You can also create more tables, if you need them... */

/*  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.*/




CREATE TABLE `Users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` CHAR(25) UNIQUE,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `Rooms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` CHAR(25) UNIQUE,
  PRIMARY KEY  (`id`)
);

CREATE TABLE `Messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `body` TEXT,
  `userId` INT,
  `roomId` INT,
  `createdAt` TIMESTAMP,
  PRIMARY KEY  (`id`),
  FOREIGN KEY (`userId`) REFERENCES Users(`id`),
  FOREIGN KEY (`roomId`) REFERENCES Rooms(`id`)
);
