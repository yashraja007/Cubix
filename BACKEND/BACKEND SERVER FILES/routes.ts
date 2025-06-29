import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertRoomSchema, insertGuestSchema, insertBookingSchema, insertWhatsappCommandSchema } from "@shared/schema";

// OpenAI and Twilio setup
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";

async function parseWhatsAppCommand(message: string): Promise<any> {
  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured, using fallback parsing");
    return { action: "unknown", message: message };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a hotel management assistant. Extract structured commands from WhatsApp messages.
            
Return JSON in this format:
{
  "action": "block_room|unblock_room|book_room|check_in|check_out|room_status|unknown",
  "room": "room_number_if_mentioned",
  "guest_name": "guest_name_if_mentioned",
  "start_date": "YYYY-MM-DD_if_mentioned",
  "end_date": "YYYY-MM-DD_if_mentioned",
  "details": "any_additional_details"
}

Examples:
"Block room 205 from July 15 to July 17" -> {"action": "block_room", "room": "205", "start_date": "2025-07-15", "end_date": "2025-07-17"}
"Check in John Smith to room 108" -> {"action": "check_in", "room": "108", "guest_name": "John Smith"}
"Room 203 maintenance complete" -> {"action": "room_status", "room": "203", "details": "maintenance complete"}`
          },
          {
            role: "user",
            content: `Extract action details from: "${message}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return { action: "unknown", message: message };
    }
  } catch (error) {
    console.error("Error parsing with OpenAI:", error);
    return { action: "unknown", message: message, error: error.message };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Rooms
  app.get("/api/rooms", async (req: Request, res: Response) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid room data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create room" });
      }
    }
  });

  app.put("/api/rooms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const room = await storage.updateRoom(id, updates);
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to update room" });
    }
  });

  app.post("/api/rooms/block", async (req: Request, res: Response) => {
    try {
      const { roomNumber, until, reason } = req.body;
      const room = await storage.blockRoom(roomNumber, until, reason);
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to block room" });
    }
  });

  app.post("/api/rooms/unblock", async (req: Request, res: Response) => {
    try {
      const { roomNumber } = req.body;
      const room = await storage.unblockRoom(roomNumber);
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to unblock room" });
    }
  });

  // Guests
  app.get("/api/guests", async (req: Request, res: Response) => {
    try {
      const guests = await storage.getGuests();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guests" });
    }
  });

  app.post("/api/guests", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(validatedData);
      res.status(201).json(guest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid guest data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create guest" });
      }
    }
  });

  // Bookings
  app.get("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid booking data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create booking" });
      }
    }
  });

  app.post("/api/bookings/:id/checkin", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.checkInGuest(id);
      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to check in guest" });
    }
  });

  app.post("/api/bookings/:id/checkout", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.checkOutGuest(id);
      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to check out guest" });
    }
  });

  // WhatsApp Commands
  app.get("/api/whatsapp/commands", async (req: Request, res: Response) => {
    try {
      const commands = await storage.getWhatsappCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp commands" });
    }
  });

  // WhatsApp Webhook
  app.post("/api/whatsapp/webhook", async (req: Request, res: Response) => {
    try {
      const { Body: message, From: sender } = req.body;
      
      if (!message || !sender) {
        res.status(400).send("Missing required parameters");
        return;
      }

      console.log(`Received WhatsApp message from ${sender}: ${message}`);

      // Parse the command using OpenAI
      const parsedAction = await parseWhatsAppCommand(message);
      
      // Store the command in database
      const command = await storage.createWhatsappCommand({
        sender,
        message,
        parsedAction: JSON.stringify(parsedAction),
        status: "pending"
      });

      // Process the command
      let responseMessage = "🔍 Command received and being processed...";
      let commandStatus = "processed";

      try {
        switch (parsedAction.action) {
          case "block_room":
            if (parsedAction.room && parsedAction.end_date) {
              const room = await storage.blockRoom(
                parsedAction.room, 
                parsedAction.end_date, 
                parsedAction.details || "Blocked via WhatsApp"
              );
              if (room) {
                responseMessage = `✅ Room ${parsedAction.room} has been blocked until ${parsedAction.end_date}`;
                commandStatus = "completed";
              } else {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
              }
            } else {
              responseMessage = "❌ Please specify room number and end date";
              commandStatus = "failed";
            }
            break;

          case "unblock_room":
            if (parsedAction.room) {
              const room = await storage.unblockRoom(parsedAction.room);
              if (room) {
                responseMessage = `✅ Room ${parsedAction.room} has been unblocked`;
                commandStatus = "completed";
              } else {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
              }
            } else {
              responseMessage = "❌ Please specify room number";
              commandStatus = "failed";
            }
            break;

          case "room_status":
            if (parsedAction.room) {
              const room = await storage.getRoomByNumber(parsedAction.room);
              if (room) {
                responseMessage = `📋 Room ${parsedAction.room} status: ${room.status.toUpperCase()}`;
                if (parsedAction.details?.includes("maintenance complete")) {
                  await storage.updateRoom(room.id, { status: "available" });
                  responseMessage += "\n✅ Room status updated to AVAILABLE";
                }
                commandStatus = "completed";
              } else {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
              }
            }
            break;

          default:
            responseMessage = `🤖 Parsed command: ${JSON.stringify(parsedAction)}\n💡 Supported actions: block_room, unblock_room, room_status`;
        }
      } catch (processError) {
        console.error("Error processing command:", processError);
        responseMessage = "❌ Error processing command";
        commandStatus = "failed";
      }

      // Update command status
      await storage.updateWhatsappCommand(command.id, {
        status: commandStatus,
        processedAt: new Date(),
        errorMessage: commandStatus === "failed" ? responseMessage : null
      });

      // Return Twilio TwiML response
      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`;

      res.set('Content-Type', 'text/xml');
      res.send(twimlResponse);

    } catch (error) {
      console.error("WhatsApp webhook error:", error);
      res.status(500).send("Internal server error");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}