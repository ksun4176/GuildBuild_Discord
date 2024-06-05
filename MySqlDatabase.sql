/*
 * Information about the game the guild is for
 */
CREATE TABLE Game (
  id int NOT NULL AUTO_INCREMENT,
  -- name of game
  name varchar(200) NOT NULL,
  PRIMARY KEY (id)
);
INSERT INTO Game (name) VALUES
('AFK Arena');

/*
 * Information about the server/community
 */
CREATE TABLE Server (
  id int NOT NULL AUTO_INCREMENT,
  -- name of community
  name varchar(200) NOT NULL,
  -- discord ID linked to server. Let it be null in case there is no discord set up
  discord_id varchar(200) DEFAULT NULL,
  -- whether the server is active
  active tinyint(1) DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT uc_server UNIQUE (discord_id)
);

/*
 * Information about the guild/team.
 */
CREATE TABLE Guild (
  id int NOT NULL AUTO_INCREMENT,
  -- foreign key to game guild is for
  game_id int NOT NULL,
  -- unique identifer for guild in game
  guild_id varchar(32) NOT NULL,
  -- name of guild
  name varchar(200) NOT NULL,
  -- foreign key to server guild is being hosted in. a guild can only belong to one server at a time.
  server_id int NOT NULL,
  -- whether the guild is active
  active tinyint(1) DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT uc_guild UNIQUE (game_id, guild_id),
  CONSTRAINT guild_game_fk FOREIGN KEY (game_id) REFERENCES Game (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT guild_server_fk FOREIGN KEY (server_id) REFERENCES Server (id) ON DELETE NO ACTION ON UPDATE CASCADE
);

/*
 * Roles users can have in the server/guild.
 */
CREATE TABLE User_Role_Type (
  id int NOT NULL AUTO_INCREMENT,
  -- name of user role type
  name varchar(200) NOT NULL,
  PRIMARY KEY (id)
);
INSERT INTO User_Role_Type (id,name) VALUES
(1, 'Server Owner'),
(2, 'Administrator'),
(3, 'Moderator'),
(4, 'Guild Management'),
(5, 'Recruiter'),
(6, 'Guild Member');

/*
 * Which roles correspond with which user_role_type
 */
CREATE TABLE User_Role (
  id int NOT NULL AUTO_INCREMENT,
  -- name of user role
  name varchar(200) NOT NULL,
  -- foreign key to type of user role
  role_type int NOT NULL,
  -- foreign key to server user role belongs to
  server_id int DEFAULT NULL,
  -- foreign key to guild user role belongs to
  guild_id int DEFAULT NULL,
  -- discord ID linked to role. Let it be null in case there is no discord set up
  discord_id varchar(200) DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uc_user_role UNIQUE (discord_id),
  CONSTRAINT user_role_type_fk FOREIGN KEY (role_type) REFERENCES User_Role_Type (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT user_role_server_fk FOREIGN KEY (server_id) REFERENCES Server (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT user_role_guild_fk FOREIGN KEY (guild_id) REFERENCES Guild (id) ON DELETE SET NULL ON UPDATE CASCADE
);

/*
 * Information about a user
 */
CREATE TABLE User (
  id int NOT NULL AUTO_INCREMENT,
  -- name of user
  name varchar(200) NOT NULL,
  -- discord ID linked to user. Let it be null in case there is no discord set up
  discord_id varchar(200) DEFAULT NULL,
  -- whether the user is active
  active tinyint(1) DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT uc_user UNIQUE (discord_id)
);

/*
 * What roles a user has
 */
CREATE TABLE USER_RELATION (
  id int NOT NULL AUTO_INCREMENT,
  -- foreign key to user
  user_id int NOT NULL,
  -- foreign key to role
  role_id int NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uc_user_relation UNIQUE (user_id, role_id),
  CONSTRAINT user_relation_user_fk FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT user_relation_role_fk FOREIGN KEY (role_id) REFERENCES User_Role (id) ON DELETE NO ACTION ON UPDATE CASCADE
);

/*
 * Applicants to guilds
 */
CREATE TABLE Guild_Applicant (
  id int NOT NULL AUTO_INCREMENT,
  -- foreign key to user
  user_id int NOT NULL,
  -- foreign key to guild user applied to
  guild_id int DEFAULT NULL,
  -- foreign key to server user applied to
  server_id int DEFAULT NULL,
  -- whether the application is active
  active tinyint(1) DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uc_guild_applicant (user_id, server_id),
  CONSTRAINT guild_applicant_user_fk FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT guild_applicant_guild_fk FOREIGN KEY (guild_id) REFERENCES Guild (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT guild_applicant_server_fk FOREIGN KEY (server_id) REFERENCES Server (id) ON DELETE SET NULL ON UPDATE CASCADE
);