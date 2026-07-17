ALTER TABLE "wines" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "description_nl" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "description_en" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "grapes" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "vintage" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "wine_type_nl" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "wine_type_en" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "region_nl" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "region_en" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "farming_method_nl" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "farming_method_en" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "vinification_nl" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "vinification_en" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "abv" real;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "food_pairing_nl" text;--> statement-breakpoint
ALTER TABLE "wines" ADD COLUMN "food_pairing_en" text;--> statement-breakpoint
CREATE UNIQUE INDEX "wines_slug_idx" ON "wines" USING btree ("slug");