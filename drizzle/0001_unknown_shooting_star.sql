CREATE TABLE `prepared_carts` (
	`lookId` varchar(96) NOT NULL,
	`cartJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prepared_carts_lookId` PRIMARY KEY(`lookId`)
);
--> statement-breakpoint
CREATE TABLE `styling_sessions` (
	`id` varchar(96) NOT NULL,
	`intentJson` text NOT NULL,
	`photoUri` text,
	`status` varchar(32) NOT NULL,
	`progressJson` text NOT NULL,
	`looksJson` text NOT NULL,
	`selectedLookId` varchar(96),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `styling_sessions_id` PRIMARY KEY(`id`)
);
