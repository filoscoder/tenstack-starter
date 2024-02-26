
SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

INSERT INTO `BANK_ACCOUNTS` (`id`, `owner_id`, `bankName`, `bankNumber`, `bankAlias`, `created_at`, `updated_at`, `owner`, `player_id`) VALUES
(7,	33666999,	'Gringots',	'09090090900909',	'leviosa.not.leviosaa',	'2024-02-09 16:29:01.929',	'2024-02-09 16:29:01.929',	'Hermione Granger',	1),
(11,	33999666,	'Gringots',	'1111111111',	'slug.eater',	'2024-02-09 16:31:48.257',	'2024-02-09 16:31:48.257',	'Ron Weasley',	2),
(18,	33999666,	'Gringots',	'0000000000',	'king.of.chess',	'2024-02-09 23:01:31.448',	'2024-02-09 23:01:31.448',	'Ron Weasley',	2),
(19,	36988666,	'The Rock',	'404040404040',	NULL,	'2024-02-22 20:43:42.048',	'2024-02-22 20:45:04.037',	'Robert Baratheon',	1);

INSERT INTO `DEPOSITS` (`id`, `player_id`, `amount`, `confirmed`, `created_at`, `updated_at`, `bank_account`) VALUES
(1,	1,	0.01,	NULL,	'2024-02-09 10:53:42.309',	'2024-02-09 16:53:42.309',	7),
(2,	2,	0.01,	NULL,	'2024-02-09 17:17:03.464',	'2024-02-09 17:17:03.464',	11),
(3,	2,	0.01,	'2024-02-09 17:25:17.456',	'2024-02-09 17:17:17.456',	'2024-02-09 17:17:17.456',	11),
(4,	1,	0.01,	NULL,	'2024-02-09 17:17:42.984',	'2024-02-09 17:17:42.984',	7),
(5,	1,	0.01,	NULL,	'2024-02-23 12:35:51.017',	'2024-02-23 12:35:51.017',	7);

INSERT INTO `PAYMENTS` (`id`, `player_id`, `amount`, `paid`, `created_at`, `updated_at`, `bank_account`) VALUES
(14,	1,	0.01,	'2024-02-10 17:21:33.262',	'2024-02-09 16:53:58.353',	'2024-02-10 17:21:33.266',	7),
(15,	2,	0.01,	NULL,	'2024-02-09 10:17:14.812',	'2024-02-09 17:17:14.812',	11),
(16,	2,	0.01,	NULL,	'2024-02-09 17:17:19.661',	'2024-02-09 17:17:19.661',	11),
(17,	1,	0.01,	'2024-02-09 17:31:56.085',	'2024-02-09 17:17:45.751',	'2024-02-09 17:31:56.088',	7),
(18,	1,	0.01,	NULL,	'2024-02-23 13:18:24.469',	'2024-02-23 13:18:24.469',	7),
(19,	1,	0.01,	NULL,	'2024-02-23 13:19:29.514',	'2024-02-23 13:19:29.514',	7),
(20,	1,	0.01,	NULL,	'2024-02-23 13:19:35.754',	'2024-02-23 13:19:35.754',	7);

INSERT INTO `PLAYERS` (`id`, `panel_id`, `username`, `password`, `email`, `first_name`, `last_name`, `date_of_birth`, `movile_number`, `country`, `balance_currency`, `status`, `created_at`, `updated_at`) VALUES
(1,	3900,	'test19',	'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',	'hello@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MX',	'ACTIVO',	'2024-02-02 16:01:19.264',	'2024-02-02 16:01:19.264'),
(2,	3859,	'test17',	'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',	'bye@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MX',	'ACTIVO',	'2024-02-06 11:45:04.408',	'2024-02-06 11:45:04.408'),
(3,	3940,	'test20',	'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',	'me@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MXN',	'ACTIVO',	'2024-02-09 19:57:41.941',	'2024-02-09 19:57:41.941');

INSERT INTO `TRANSACTIONS` (`id`, `sender_id`, `recipient_id`, `amount`, `date`, `status`, `created_at`, `updated_at`) VALUES
(56,	414,	3900,	0.01,	'2024-02-23 12:35:51.005',	'COMPLETED',	'2024-02-23 12:35:51.006',	'2024-02-23 12:35:51.006'),
(57,	414,	3900,	0.01,	'2024-02-23 13:18:24.453',	'COMPLETED',	'2024-02-23 13:18:24.456',	'2024-02-23 13:18:24.456'),
(58,	3900,	414,	0.01,	'2024-02-23 13:19:29.499',	'COMPLETED',	'2024-02-23 13:19:29.502',	'2024-02-23 13:19:29.502'),
(59,	3900,	414,	0.01,	'2024-02-23 13:19:35.740',	'COMPLETED',	'2024-02-23 13:19:35.743',	'2024-02-23 13:19:35.743'),
(60,	3900,	414,	0.01,	'2024-02-23 13:19:38.848',	'INCOMPLETE',	'2024-02-23 13:19:38.851',	'2024-02-23 13:19:38.851'),
(61,	3900,	414,	0.01,	'2024-02-23 13:22:01.326',	'INCOMPLETE',	'2024-02-23 13:22:01.329',	'2024-02-23 13:22:01.329');

INSERT INTO `USERS_ROOT` (`id`, `username`, `password`, `panel_id`, `access`, `refresh`, `json_response`, `dirty`, `created_at`, `updated_at`) VALUES
(3,	'luquin',	'{\"ivArray\":[\"98\",\"178\",\"232\",\"94\",\"155\",\"6\",\"15\",\"40\",\"39\",\"234\",\"143\",\"28\",\"44\",\"43\",\"56\",\"92\"],\"ciphertext\":\"a2b3df852669cf01f9983953dc67cf43\"}',	414,	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4Njk1MTIwLCJqdGkiOiJlN2IzNTcyZTEzNTA0ZDcyYWQyNDA0YzdmOWQzYTNlNSIsInVzZXJfaWQiOjQxNCwicmVmcmVzaF9zaGlmdCI6MTIwLCJ1dWlkIjoiOGE2OGM0ZTgwNGY4NDc2Zjk1OGM0NTJiZjE0YzcxN2YifQ.gOf5JEObwX24EEloDfDzawJX0pavbLssb_xL2vUkccI',	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcwODY5ODEyMCwianRpIjoiODVjNDI1Mjg2M2IxNDRkNTlmZGY3MWFiNmE5ZDQwNTUiLCJ1c2VyX2lkIjo0MTQsInJlZnJlc2hfc2hpZnQiOjEyMCwidXVpZCI6IjhhNjhjNGU4MDRmODQ3NmY5NThjNDUyYmYxNGM3MTdmIn0.g2TDjCxGLBFot0LE1h1WYVCAoXSKKHNAaeHg9wVedmk',	'{\"id\":414,\"jackpots_won\":[],\"is_email_verified\":true,\"info\":{\"first_name\":\"lucas\",\"last_name\":\"lucas\",\"date_of_birth\":null,\"mobile_number\":\"\",\"country\":\"\",\"city\":\"\",\"street_address\":\"\",\"postal_code\":\"\",\"state\":null},\"bonus_balance\":\"0.00\",\"balance\":\"9.27\",\"role\":\"PA\",\"email\":\"luquin@gmail.com\",\"is_withdraw_allowed\":true,\"is_banned\":false,\"access\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA4Njk1MTIwLCJqdGkiOiJlN2IzNTcyZTEzNTA0ZDcyYWQyNDA0YzdmOWQzYTNlNSIsInVzZXJfaWQiOjQxNCwicmVmcmVzaF9zaGlmdCI6MTIwLCJ1dWlkIjoiOGE2OGM0ZTgwNGY4NDc2Zjk1OGM0NTJiZjE0YzcxN2YifQ.gOf5JEObwX24EEloDfDzawJX0pavbLssb_xL2vUkccI\",\"refresh\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcwODY5ODEyMCwianRpIjoiODVjNDI1Mjg2M2IxNDRkNTlmZGY3MWFiNmE5ZDQwNTUiLCJ1c2VyX2lkIjo0MTQsInJlZnJlc2hfc2hpZnQiOjEyMCwidXVpZCI6IjhhNjhjNGU4MDRmODQ3NmY5NThjNDUyYmYxNGM3MTdmIn0.g2TDjCxGLBFot0LE1h1WYVCAoXSKKHNAaeHg9wVedmk\",\"last_login\":\"2024-02-23T13:22:00.225711Z\",\"username\":\"luquin\",\"first_name\":\"\",\"last_name\":\"\",\"date_joined\":\"2023-11-15T16:52:59.768862Z\",\"balance_currency\":\"MXN\",\"bonus_balance_currency\":\"MXN\",\"is_self_registered\":false,\"language\":\"en-US\",\"needs_document_approve\":true,\"affise_data\":null,\"pap_data\":null,\"cpf_document\":null,\"parent\":3}',	0,	'2024-02-23 13:22:00.401',	'2024-02-23 13:22:00.401');

-- 2024-02-23 13:26:32