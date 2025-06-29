import { apiRequest } from './queryClient';

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  checkinsToday: number;
  revenueToday: number;
}

export const api = {
  // Dashboard
  getDashboardStats: (): Promise<DashboardStats> =>
    fetch('/api/dashboard/stats', { credentials: 'include' }).then(res => res.json()),

  // Rooms
  getRooms: () =>
    fetch('/api/rooms', { credentials: 'include' }).then(res => res.json()),

  blockRoom: (roomNumber: string, until: string, reason: string) =>
    apiRequest('POST', '/api/rooms/block', { roomNumber, until, reason }),

  unblockRoom: (roomNumber: string) =>
    apiRequest('POST', '/api/rooms/unblock', { roomNumber }),

  // Bookings
  getBookings: () =>
    fetch('/api/bookings', { credentials: 'include' }).then(res => res.json()),

  checkInGuest: (bookingId: number) =>
    apiRequest('POST', `/api/bookings/${bookingId}/checkin`),

  checkOutGuest: (bookingId: number) =>
    apiRequest('POST', `/api/bookings/${bookingId}/checkout`),

  // Guests
  getGuests: () =>
    fetch('/api/guests', { credentials: 'include' }).then(res => res.json()),

  // WhatsApp Commands
  getWhatsappCommands: () =>
    fetch('/api/whatsapp/commands', { credentials: 'include' }).then(res => res.json()),
};
