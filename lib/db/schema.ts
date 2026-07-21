import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, date, uniqueIndex, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentBlocks = pgTable("content_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  page: text("page").notNull(),
  section: text("section").notNull(),
  fieldKey: text("field_key").notNull(),
  valueNl: text("value_nl").notNull(),
  valueEn: text("value_en").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id),
}, (table) => ({
  uniqueField: uniqueIndex("content_blocks_page_section_field_key_idx").on(table.page, table.section, table.fieldKey),
}));

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  storageKey: text("storage_key").notNull(),
  filename: text("filename").notNull(),
  altTextNl: text("alt_text_nl").notNull().default(""),
  altTextEn: text("alt_text_en").notNull().default(""),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wines = pgTable("wines", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug"),
  name: text("name").notNull(),
  metaNl: text("meta_nl").notNull(),
  metaEn: text("meta_en").notNull(),
  tagNl: text("tag_nl").notNull(),
  tagEn: text("tag_en").notNull(),
  imageId: uuid("image_id").references(() => media.id),
  shopifyHandle: text("shopify_handle").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  showOnHomepage: boolean("show_on_homepage").notNull().default(true),
  descriptionNl: text("description_nl"),
  descriptionEn: text("description_en"),
  grapes: text("grapes"),
  vintage: text("vintage"),
  wineTypeNl: text("wine_type_nl"),
  wineTypeEn: text("wine_type_en"),
  regionNl: text("region_nl"),
  regionEn: text("region_en"),
  farmingMethodNl: text("farming_method_nl"),
  farmingMethodEn: text("farming_method_en"),
  vinificationNl: text("vinification_nl"),
  vinificationEn: text("vinification_en"),
  abv: real("abv"),
  foodPairingNl: text("food_pairing_nl"),
  foodPairingEn: text("food_pairing_en"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueSlug: uniqueIndex("wines_slug_idx").on(table.slug),
}));

export const reservationTrackEnum = pgEnum("reservation_track", ["standaard", "zakelijk"]);
export const reservationStatusEnum = pgEnum("reservation_status", ["nieuw", "in_behandeling", "bevestigd", "afgewezen"]);

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  track: reservationTrackEnum("track").notNull(),
  status: reservationStatusEnum("status").notNull().default("nieuw"),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  partySize: integer("party_size"),
  groupSize: integer("group_size"),
  companyName: text("company_name"),
  occasion: text("occasion"),
  preferredPeriod: text("preferred_period"),
  requestedDate: date("requested_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// A block is either the whole day (isFullDay, label unused) or a specific
// free-text time slot (e.g. "14:00-17:00 - besloten feest"). The team works
// variable hours, so slots are free text rather than fixed morning/afternoon
// buckets - the admin UI caps a day at 4 slot rows, but nothing here enforces
// that limit at the data level.
export const availabilityBlocks = pgTable("availability_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  isFullDay: boolean("is_full_day").notNull().default(false),
  label: text("label"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
