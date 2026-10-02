CREATE TABLE `snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`period` text NOT NULL,
	`kind` text NOT NULL,
	`source` text NOT NULL,
	`rows` text NOT NULL,
	`created_at` text NOT NULL
);
