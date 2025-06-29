import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"), // admin, manager, staff
  name: text("name").notNull(),
  email: text("email"),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  type: text("type").notNull(), // standard, deluxe, suite, executive
  status: text("status").notNull().default("available"), // available, occupied, maintenance, blocked
  floor: integer("floor").notNull(),
  maxOccupancy: integer("max_occupancy").notNull().default(2),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  amenities: text("amenities").array().default([]),
  blockedUntil: date("blocked_until"),
  blockReason: text("block_reason"),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  idNumber: text("id_number"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").references(() => guests.id).notNull(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  actualCheckIn: timestamp("actual_check_in"),
  actualCheckOut: timestamp("actual_check_out"),
  status: text("status").notNull().default("confirmed"), // confirmed, checked_in, checked_out, cancelled, pending
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const whatsappCommands = pgTable("whatsapp_commands", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(), // phone number
  message: text("message").notNull(),
  parsedAction: text("parsed_action"), // JSON string of parsed command
  status: text("status").notNull().default("pending"), // pending, processed, failed, completed
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  actualCheckIn: true,
  actualCheckOut: true,
});

export const insertWhatsappCommandSchema = createInsertSchema(whatsappCommands).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type WhatsappCommand = typeof whatsappCommands.$inferSelect;
export type InsertWhatsappCommand = z.infer<typeof insertWhatsappCommandSchema>;

// Extended types for API responses
export type BookingWithGuest = Booking & {
  guest: Guest;
  room: Room;
};

export type RoomWithCurrentBooking = Room & {
  currentBooking?: BookingWithGuest;
};