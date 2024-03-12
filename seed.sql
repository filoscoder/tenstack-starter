-- Adminer 4.8.1 MySQL 8.2.0 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

INSERT INTO `BANK_ACCOUNTS` (`id`, `owner_id`, `bankName`, `bankNumber`, `bankAlias`, `created_at`, `updated_at`, `owner`, `player_id`) VALUES
(7,	33666999,	'Gringots',	'09090090900909',	'leviosa.not.leviosaaa',	'2024-02-09 16:29:01.929',	'2024-02-29 17:59:58.943',	'Hermione Granger',	1),
(11,	33999666,	'Gringots',	'1111111111',	'slug.eater',	'2024-02-09 16:31:48.257',	'2024-02-09 16:31:48.257',	'Ron Weasley',	2),
(18,	33999666,	'Gringots',	'0000000000',	'king.of.chess',	'2024-02-09 23:01:31.448',	'2024-02-09 23:01:31.448',	'Ron Weasley',	2),
(19,	36988666,	'The Rock',	'404040404040',	NULL,	'2024-02-22 20:43:42.048',	'2024-02-22 20:45:04.037',	'Robert Baratheon',	1);

INSERT INTO `DEPOSITS` (`id`, `player_id`, `amount`, `confirmed`, `created_at`, `updated_at`, `bank_account`, `currency`, `dirty`, `coins_transfered`) VALUES
(24,	1,	0.01,	'2024-03-05 20:54:37.157',	'2024-03-05 14:14:28.640',	'2024-03-05 20:54:38.128',	7,	'MXN',	0,	'2024-03-05 20:40:41.159'),
(25,	1,	1,	'2024-03-05 14:24:48.624',	'2024-03-05 14:15:56.846',	'2024-03-05 20:40:41.161',	7,	'MXN',	0,	'2024-03-05 20:40:41.159'),
(26,	1,	10,	'2024-03-06 11:23:58.974',	'2024-03-05 21:13:53.800',	'2024-03-06 11:23:58.986',	7,	'MXN',	0,	NULL),
(27,	1,	0.01,	NULL,	'2024-03-06 17:10:00.065',	'2024-03-06 17:10:03.125',	7,	'MXN',	0,	NULL),
(28,	1,	0.01,	NULL,	'2024-03-06 17:16:57.672',	'2024-03-06 17:17:00.688',	7,	'MXN',	0,	NULL);

INSERT INTO `PAYMENTS` (`id`, `player_id`, `amount`, `paid`, `created_at`, `updated_at`, `bank_account`, `currency`) VALUES
(14,	1,	0.01,	'2024-02-10 17:21:33.262',	'2024-02-09 16:53:58.353',	'2024-02-10 17:21:33.266',	7,	'MXN'),
(15,	2,	0.01,	NULL,	'2024-02-09 10:17:14.812',	'2024-02-09 17:17:14.812',	11,	'MXN'),
(16,	2,	0.01,	NULL,	'2024-02-09 17:17:19.661',	'2024-02-09 17:17:19.661',	11,	'MXN'),
(17,	1,	0.01,	'2024-02-09 17:31:56.085',	'2024-02-09 17:17:45.751',	'2024-02-09 17:31:56.088',	7,	'MXN'),
(18,	1,	0.01,	'2024-02-23 17:34:15.900',	'2024-02-23 13:18:24.469',	'2024-02-23 17:34:15.904',	7,	'MXN'),
(19,	1,	0.01,	'2024-02-23 17:35:24.053',	'2024-02-23 13:19:29.514',	'2024-02-23 17:35:24.055',	7,	'MXN'),
(20,	1,	0.01,	'2024-02-23 16:57:45.365',	'2024-02-23 13:19:35.754',	'2024-02-23 16:57:45.375',	7,	'MXN'),
(21,	1,	0.01,	NULL,	'2024-02-23 19:45:45.412',	'2024-02-23 19:45:45.412',	7,	'MXN'),
(22,	1,	0.02,	'2024-02-26 12:30:45.697',	'2024-02-23 19:53:53.337',	'2024-02-26 12:30:45.700',	7,	'MXN'),
(23,	1,	0.03,	NULL,	'2024-02-26 19:19:30.725',	'2024-02-26 19:19:30.725',	7,	'MXN'),
(24,	1,	0.04,	NULL,	'2024-02-27 14:38:50.896',	'2024-02-27 14:38:50.896',	7,	'MXN'),
(25,	1,	0.01,	NULL,	'2024-02-29 18:51:14.752',	'2024-02-29 18:51:14.752',	7,	'MXN'),
(26,	1,	6.13,	NULL,	'2024-03-05 20:55:27.642',	'2024-03-05 20:55:27.642',	7,	'MXN');

INSERT INTO `PLAYERS` (`id`, `panel_id`, `username`, `password`, `email`, `first_name`, `last_name`, `date_of_birth`, `movile_number`, `country`, `balance_currency`, `status`, `created_at`, `updated_at`) VALUES
(1,	3900,	'test19',	'$2b$10$4ReAbWcT.Q8PLGO2Gkc6H.qFTJabPC.cgPDAPfclAt1/ssLWMwh52',	'hello@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MX',	'ACTIVO',	'2024-02-02 16:01:19.264',	'2024-03-06 17:05:28.401'),
(2,	3859,	'test17',	'$2b$10$twY7L8HNkIlYqFIOg5I9u.gluleI55wFGZ5L.iyw4SNISlJrIH9iy',	'bye@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MX',	'ACTIVO',	'2024-02-06 11:45:04.408',	'2024-03-06 17:06:24.766'),
(3,	3940,	'test20',	'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',	'me@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MXN',	'ACTIVO',	'2024-02-09 19:57:41.941',	'2024-02-09 19:57:41.941'),
(4,	3885,	'test18',	'$2b$10$J.Dh5d6Y0vnwuoph.a9piu6XqNy20TSyJzLJkGNjqIkkKISq1WNyu',	'hello1@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MXN',	'ACTIVO',	'2024-02-27 12:19:14.510',	'2024-03-06 17:09:08.893'),
(16,	5940,	'test24',	'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'MXN',	'ACTIVO',	'2024-02-27 13:22:09.299',	'2024-02-28 22:25:35.356'),
(17,	5941,	'test25',	'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',	'hello2@example.com',	'Tom',	'Bombadil',	NULL,	NULL,	NULL,	'MXN',	'ACTIVO',	'2024-02-27 13:23:00.607',	'2024-02-27 13:23:00.607'),
(18,	6026,	'test26',	'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'MXN',	'ACTIVO',	'2024-02-29 17:55:07.367',	'2024-02-29 17:55:07.367'),
(19,	6446,	'test28',	'$2b$10$bll0tNIl9yPNgop2jwUuM.t1f0d6dnfHG0S8DU9fQ51Ba7ntuGaiu',	'hello28@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MXN',	'ACTIVO',	'2024-03-06 17:15:33.685',	'2024-03-06 17:15:33.685'),
(29,	6820,	'test37',	'$2b$10$VzuKTv8tiYp.U3n3mpd4K.j.xzIpT4NYcn9Me2FZUZevsaLw8z3nK',	'hello37@example.com',	NULL,	NULL,	NULL,	NULL,	NULL,	'MXN',	'ACTIVO',	'2024-03-11 17:26:07.900',	'2024-03-11 17:26:07.900');

INSERT INTO `ROLES` (`id`, `name`) VALUES
(1,	'agent'),
(2,	'player');

INSERT INTO `TOKENS` (`id`, `invalid`, `next`, `player_id`, `created_at`, `updated_at`, `user_agent`) VALUES
('1d7c1d92-2374-4782-b144-fe7a55cbb38c',	0,	NULL,	29,	'2024-03-11 17:26:07.911',	'2024-03-11 17:26:07.911',	'curl/7.81.0'),
('b5d93a4c-6edc-41d5-bd94-6b28482815b1',	0,	NULL,	1,	'2024-03-11 17:24:49.098',	'2024-03-11 17:24:49.098',	'curl/7.81.0');

INSERT INTO `TRANSACTIONS` (`id`, `sender_id`, `recipient_id`, `amount`, `date`, `status`, `created_at`, `updated_at`) VALUES
(56,	414,	3900,	0.01,	'2024-02-23 12:35:51.005',	'COMPLETED',	'2024-02-23 12:35:51.006',	'2024-02-23 12:35:51.006'),
(57,	414,	3900,	0.01,	'2024-02-23 13:18:24.453',	'COMPLETED',	'2024-02-23 13:18:24.456',	'2024-02-23 13:18:24.456'),
(58,	3900,	414,	0.01,	'2024-02-23 13:19:29.499',	'COMPLETED',	'2024-02-23 13:19:29.502',	'2024-02-23 13:19:29.502'),
(59,	3900,	414,	0.01,	'2024-02-23 13:19:35.740',	'COMPLETED',	'2024-02-23 13:19:35.743',	'2024-02-23 13:19:35.743'),
(60,	3900,	414,	0.01,	'2024-02-23 13:19:38.848',	'INCOMPLETE',	'2024-02-23 13:19:38.851',	'2024-02-23 13:19:38.851'),
(61,	3900,	414,	0.01,	'2024-02-23 13:22:01.326',	'INCOMPLETE',	'2024-02-23 13:22:01.329',	'2024-02-23 13:22:01.329'),
(62,	414,	1,	0.01,	'2024-02-23 19:42:39.319',	'COMPLETED',	'2024-02-23 19:42:39.322',	'2024-02-23 19:42:39.322'),
(63,	414,	1,	0.01,	'2024-02-23 19:42:57.961',	'COMPLETED',	'2024-02-23 19:42:57.963',	'2024-02-23 19:42:57.963'),
(64,	1,	414,	0.01,	'2024-02-23 19:43:18.368',	'INCOMPLETE',	'2024-02-23 19:43:18.371',	'2024-02-23 19:43:18.371'),
(65,	414,	3900,	0.01,	'2024-02-23 19:45:38.955',	'COMPLETED',	'2024-02-23 19:45:38.957',	'2024-02-23 19:45:38.957'),
(66,	3900,	414,	0.01,	'2024-02-23 19:45:45.356',	'COMPLETED',	'2024-02-23 19:45:45.359',	'2024-02-23 19:45:45.359'),
(67,	414,	3900,	0.01,	'2024-02-23 19:52:34.028',	'COMPLETED',	'2024-02-23 19:52:34.031',	'2024-02-23 19:52:34.031'),
(68,	414,	3900,	0.01,	'2024-02-23 19:53:38.242',	'COMPLETED',	'2024-02-23 19:53:38.245',	'2024-02-23 19:53:38.245'),
(69,	3900,	414,	0.02,	'2024-02-23 19:53:53.282',	'COMPLETED',	'2024-02-23 19:53:53.284',	'2024-02-23 19:53:53.284'),
(70,	414,	3900,	0.01,	'2024-02-23 20:14:28.159',	'COMPLETED',	'2024-02-23 20:14:28.161',	'2024-02-23 20:14:28.161'),
(71,	414,	3900,	0.01,	'2024-02-26 19:16:22.658',	'COMPLETED',	'2024-02-26 19:16:22.662',	'2024-02-26 19:16:22.662'),
(72,	414,	3900,	0.01,	'2024-02-26 19:19:09.334',	'COMPLETED',	'2024-02-26 19:19:09.337',	'2024-02-26 19:19:09.337'),
(73,	3900,	414,	0.03,	'2024-02-26 19:19:30.713',	'COMPLETED',	'2024-02-26 19:19:30.716',	'2024-02-26 19:19:30.716'),
(74,	414,	3900,	0.01,	'2024-02-27 14:14:23.654',	'COMPLETED',	'2024-02-27 14:14:23.657',	'2024-02-27 14:14:23.657'),
(75,	414,	3900,	0.01,	'2024-02-27 14:33:00.569',	'COMPLETED',	'2024-02-27 14:33:00.572',	'2024-02-27 14:33:00.572'),
(76,	414,	3900,	0.01,	'2024-02-27 14:33:21.304',	'COMPLETED',	'2024-02-27 14:33:21.307',	'2024-02-27 14:33:21.307'),
(77,	414,	3900,	0.01,	'2024-02-27 14:34:02.971',	'COMPLETED',	'2024-02-27 14:34:02.973',	'2024-02-27 14:34:02.973'),
(78,	3900,	414,	0.04,	'2024-02-27 14:38:50.882',	'COMPLETED',	'2024-02-27 14:38:50.885',	'2024-02-27 14:38:50.885'),
(79,	3900,	414,	0.04,	'2024-02-27 14:40:19.966',	'INCOMPLETE',	'2024-02-27 14:40:19.969',	'2024-02-27 14:40:19.969'),
(80,	414,	3900,	0.01,	'2024-02-29 18:48:02.283',	'COMPLETED',	'2024-02-29 18:48:02.287',	'2024-02-29 18:48:02.287'),
(81,	3900,	414,	0.01,	'2024-02-29 18:51:14.740',	'COMPLETED',	'2024-02-29 18:51:14.743',	'2024-02-29 18:51:14.743'),
(82,	414,	3900,	0.01,	'2024-03-05 14:15:12.403',	'COMPLETED',	'2024-03-05 14:15:12.406',	'2024-03-05 14:15:12.406'),
(83,	414,	3900,	9.21,	'2024-03-05 14:16:15.250',	'INCOMPLETE',	'2024-03-05 14:16:15.252',	'2024-03-05 14:16:15.252'),
(84,	414,	3900,	9.21,	'2024-03-05 14:19:03.168',	'INCOMPLETE',	'2024-03-05 14:19:03.171',	'2024-03-05 14:19:03.171'),
(85,	414,	3900,	9.21,	'2024-03-05 14:24:49.581',	'INCOMPLETE',	'2024-03-05 14:24:49.583',	'2024-03-05 14:24:49.583'),
(86,	414,	3900,	9.21,	'2024-03-05 20:08:18.961',	'INCOMPLETE',	'2024-03-05 20:08:18.964',	'2024-03-05 20:08:18.964'),
(87,	414,	3900,	9.21,	'2024-03-05 20:12:04.961',	'INCOMPLETE',	'2024-03-05 20:12:04.964',	'2024-03-05 20:12:04.964'),
(88,	414,	3900,	1,	'2024-03-05 20:12:34.542',	'COMPLETED',	'2024-03-05 20:12:34.545',	'2024-03-05 20:12:34.545'),
(89,	414,	3900,	1,	'2024-03-05 20:23:18.132',	'COMPLETED',	'2024-03-05 20:23:18.134',	'2024-03-05 20:23:18.134'),
(90,	414,	3900,	1,	'2024-03-05 20:25:57.768',	'COMPLETED',	'2024-03-05 20:25:57.770',	'2024-03-05 20:25:57.770'),
(91,	414,	3900,	1,	'2024-03-05 20:33:08.618',	'COMPLETED',	'2024-03-05 20:33:08.620',	'2024-03-05 20:33:08.620'),
(92,	414,	3900,	1,	'2024-03-05 20:34:09.325',	'COMPLETED',	'2024-03-05 20:34:09.328',	'2024-03-05 20:34:09.328'),
(93,	414,	3900,	0.01,	'2024-03-05 20:40:40.154',	'COMPLETED',	'2024-03-05 20:40:40.158',	'2024-03-05 20:40:40.158'),
(94,	414,	3900,	1,	'2024-03-05 20:40:41.170',	'COMPLETED',	'2024-03-05 20:40:41.173',	'2024-03-05 20:40:41.173'),
(95,	414,	3900,	0.01,	'2024-03-05 20:41:33.015',	'COMPLETED',	'2024-03-05 20:41:33.017',	'2024-03-05 20:41:33.017'),
(96,	414,	3900,	0.01,	'2024-03-05 20:43:33.968',	'COMPLETED',	'2024-03-05 20:43:33.970',	'2024-03-05 20:43:33.970'),
(97,	414,	3900,	0.01,	'2024-03-05 20:44:30.455',	'COMPLETED',	'2024-03-05 20:44:30.457',	'2024-03-05 20:44:30.457'),
(98,	414,	3900,	0.01,	'2024-03-05 20:46:42.415',	'COMPLETED',	'2024-03-05 20:46:42.417',	'2024-03-05 20:46:42.417'),
(99,	414,	3900,	0.01,	'2024-03-05 20:50:45.249',	'COMPLETED',	'2024-03-05 20:50:45.251',	'2024-03-05 20:50:45.251'),
(100,	414,	3900,	0.01,	'2024-03-05 20:53:30.983',	'COMPLETED',	'2024-03-05 20:53:30.986',	'2024-03-05 20:53:30.986'),
(101,	414,	3900,	0.01,	'2024-03-05 20:54:38.134',	'COMPLETED',	'2024-03-05 20:54:38.136',	'2024-03-05 20:54:38.136'),
(102,	3900,	414,	6.13,	'2024-03-05 20:55:27.589',	'COMPLETED',	'2024-03-05 20:55:27.592',	'2024-03-05 20:55:27.592'),
(103,	414,	3900,	10,	'2024-03-05 21:19:52.766',	'INCOMPLETE',	'2024-03-05 21:19:52.769',	'2024-03-05 21:19:52.769'),
(104,	414,	3900,	10,	'2024-03-05 21:37:17.190',	'INCOMPLETE',	'2024-03-05 21:37:17.192',	'2024-03-05 21:37:17.192'),
(105,	414,	3900,	10,	'2024-03-05 21:43:52.953',	'INCOMPLETE',	'2024-03-05 21:43:52.956',	'2024-03-05 21:43:52.956'),
(106,	414,	3900,	10,	'2024-03-05 21:48:36.145',	'INCOMPLETE',	'2024-03-05 21:48:36.148',	'2024-03-05 21:48:36.148'),
(107,	414,	3900,	10,	'2024-03-05 21:52:13.588',	'INCOMPLETE',	'2024-03-05 21:52:13.591',	'2024-03-05 21:52:13.591'),
(108,	414,	3900,	10,	'2024-03-05 23:54:50.812',	'INCOMPLETE',	'2024-03-05 23:54:50.814',	'2024-03-05 23:54:50.814'),
(109,	414,	3900,	10,	'2024-03-05 23:55:39.377',	'INCOMPLETE',	'2024-03-05 23:55:39.379',	'2024-03-05 23:55:39.379'),
(110,	414,	3900,	10,	'2024-03-05 23:58:57.898',	'INCOMPLETE',	'2024-03-05 23:58:57.901',	'2024-03-05 23:58:57.901'),
(111,	414,	3900,	10,	'2024-03-06 00:00:23.162',	'INCOMPLETE',	'2024-03-06 00:00:23.164',	'2024-03-06 00:00:23.164'),
(112,	414,	3900,	10,	'2024-03-06 00:06:00.703',	'INCOMPLETE',	'2024-03-06 00:06:00.705',	'2024-03-06 00:06:00.705'),
(113,	414,	3900,	10,	'2024-03-06 00:12:10.358',	'INCOMPLETE',	'2024-03-06 00:12:10.361',	'2024-03-06 00:12:10.361'),
(114,	414,	3900,	10,	'2024-03-06 00:28:58.503',	'INCOMPLETE',	'2024-03-06 00:28:58.507',	'2024-03-06 00:28:58.507'),
(115,	414,	3900,	10,	'2024-03-06 11:23:27.283',	'INCOMPLETE',	'2024-03-06 11:23:27.287',	'2024-03-06 11:23:27.287'),
(116,	414,	3900,	10,	'2024-03-06 11:23:59.929',	'INCOMPLETE',	'2024-03-06 11:23:59.932',	'2024-03-06 11:23:59.932');

INSERT INTO `WEB_PUSH_SUBSCRIPTIONS` (`id`, `endpoint`, `keys`, `expirationTime`, `created_at`, `updated_at`) VALUES
('0db24e46-e88e-4dcf-aa46-0f4864d9bce6',	'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABl6G1_7dC4XZt8tyakWb4tkgkUPa5OdZdcppzodaq7V-ppV-8W-2VdI0wNTagd8Stza8cWtnod6mCIXuKN2fB7oTWW-Npblv0b8DduIVQ4sh9_HkOKrPejPf2aiWo41NgBOF4EjTXvI34VuHrsrGJXINkFKEuGwqIArd44biQUpvryiBY',	'\"{\\\"auth\\\":\\\"BajUs3_hjWvV-YelV8wvoA\\\",\\\"p256dh\\\":\\\"BCgLxINCe2RsHj7dy2g0ZHebIEB5PHbL7R-kE7AbHfZEmtJ0p9j55zsLV3u2mH0YExz_FuYX8YTbzSsxGbMkPgo\\\"}\"',	NULL,	'2024-03-06 13:19:59.587',	'2024-03-06 13:19:59.587'),
('cac07b28-1e41-48bd-b47c-6896cdbf98bd',	'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABl57HpCWQY48l7rJCq4hdyDvEZn9M08eeqznLAaS07i-vtt-gOm9fvkTy3GMFAPv0sM0AmauufRETopV8fwAApGDFSwpRKPu3QaXkvh2kgPXNwZ-12-poW08R5n_MqwSxwuAa9BvaByes2vqtxyUdzsIpxXtHiYm8e8Gy2fKysvsPWnYE',	'\"{\\\"auth\\\":\\\"t1613F43pz5cG15yiFpFPg\\\",\\\"p256dh\\\":\\\"BGOwYrogG0_mjsKULF7X5Fv8hJCitTIEISvGMmvmYmNeP8Tyw04yq5bidXvQ_tyuj12TIc0UCLoVBKobNLUtVh0\\\"}\"',	NULL,	'2024-03-05 23:59:38.013',	'2024-03-05 23:59:38.013');

INSERT INTO `_PlayerToRole` (`A`, `B`) VALUES
(28,	1),
(1,	2),
(2,	2),
(3,	2),
(4,	2),
(16,	2),
(17,	2),
(18,	2),
(19,	2),
(29,	2);

-- 2024-03-11 17:50:32
