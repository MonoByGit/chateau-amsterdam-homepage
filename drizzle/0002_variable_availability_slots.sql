ALTER TABLE "availability_blocks" ADD COLUMN "is_full_day" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "availability_blocks" ADD COLUMN "label" text;--> statement-breakpoint
UPDATE "availability_blocks" SET "is_full_day" = true WHERE "daypart" = 'hele_dag';--> statement-breakpoint
UPDATE "availability_blocks" SET "label" = CASE "daypart"
  WHEN 'ochtend' THEN 'Ochtend (9-12u)'
  WHEN 'middag' THEN 'Middag (12-17u)'
  WHEN 'avond' THEN 'Avond (17-22u)'
  ELSE NULL
END WHERE "daypart" != 'hele_dag';--> statement-breakpoint
DROP INDEX "availability_blocks_date_daypart_idx";--> statement-breakpoint
ALTER TABLE "availability_blocks" DROP COLUMN "daypart";--> statement-breakpoint
ALTER TABLE "availability_blocks" DROP COLUMN "reason";--> statement-breakpoint
DROP TYPE "public"."availability_daypart";
