import { EventEmitter } from "events";

/**
 * EVENT-DRIVEN NOTIFICATION ARCHITECTURE
 *
 * Events are emitted by core business logic
 * External handlers (WhatsApp, Email, etc.) subscribe to events
 * This decouples notification logic from core system
 *
 * Benefits:
 * - Easy to add new notification channels
 * - Non-blocking (async)
 * - Testable
 * - Scalable (can use message queues later)
 */

export enum SystemEvent {
  TUTOR_REGISTERED = "tutor.registered",
  APPOINTMENT_SCHEDULED = "appointment.scheduled",
  TUTOR_CHECKED_IN = "tutor.checked_in",
  TUTOR_APPROVED = "tutor.approved",
  TUTOR_REJECTED = "tutor.rejected",
  DOCUMENT_UPLOADED = "document.uploaded",
  APPOINTMENT_COMPLETED = "appointment.completed",
}

export interface EventPayload {
  [SystemEvent.TUTOR_REGISTERED]: {
    tutorId: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  [SystemEvent.APPOINTMENT_SCHEDULED]: {
    appointmentId: string;
    tutorId: string;
    tutorEmail: string;
    scheduledAt: Date;
    adminName: string;
  };

  [SystemEvent.TUTOR_CHECKED_IN]: {
    tutorId: string;
    tutorEmail: string;
    tutorName: string;
    appointmentId: string;
    checkedInAt: Date;
  };

  [SystemEvent.TUTOR_APPROVED]: {
    tutorId: string;
    tutorEmail: string;
    tutorName: string;
    approvedBy: string;
    approvedAt: Date;
  };

  [SystemEvent.TUTOR_REJECTED]: {
    tutorId: string;
    tutorEmail: string;
    tutorName: string;
    reason: string;
    rejectedBy: string;
  };

  [SystemEvent.DOCUMENT_UPLOADED]: {
    tutorId: string;
    documentType: string;
    fileName: string;
    uploadedAt: Date;
  };

  [SystemEvent.APPOINTMENT_COMPLETED]: {
    appointmentId: string;
    tutorId: string;
    tutorEmail: string;
    completedAt: Date;
  };
}

type EventHandler<E extends SystemEvent> = (
  payload: EventPayload[E],
) => Promise<void>;

class EventService extends EventEmitter {
  private handlers: Map<SystemEvent, EventHandler<any>[]> = new Map();

  /**
   * Subscribe to an event
   */
  subscribe<E extends SystemEvent>(event: E, handler: EventHandler<E>) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);

    this.on(event, handler);
    return () => this.unsubscribe(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe<E extends SystemEvent>(event: E, handler: EventHandler<E>) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
    this.off(event, handler);
  }

  /**
   * Emit an event
   * Non-blocking - handlers run asynchronously
   */
  async emit<E extends SystemEvent>(event: E, payload: EventPayload[E]) {
    const handlers = this.handlers.get(event) || [];

    // Run all handlers concurrently
    await Promise.all(
      handlers.map((handler) =>
        handler(payload).catch((error) => {
          console.error(`[EventService] Error in ${event} handler:`, error);
        }),
      ),
    );
  }

  /**
   * Emit synchronously (blocking)
   * Use with caution - only for critical events
   */
  emitSync<E extends SystemEvent>(event: E, payload: EventPayload[E]) {
    this.emit(event, payload); // Still async internally
  }
}

// Export singleton
export const eventService = new EventService();

/**
 * NOTIFICATION SERVICE ABSTRACTION
 * Decouples notification implementation from events
 */

export interface NotificationHandler {
  canHandle(event: SystemEvent): boolean;
  handle<E extends SystemEvent>(
    event: E,
    payload: EventPayload[E],
  ): Promise<void>;
}

/**
 * Example: Email Notification Handler
 * (Ready for integration with email service)
 */
export class EmailNotificationHandler implements NotificationHandler {
  canHandle(event: SystemEvent): boolean {
    return [
      SystemEvent.TUTOR_REGISTERED,
      SystemEvent.APPOINTMENT_SCHEDULED,
      SystemEvent.TUTOR_APPROVED,
      SystemEvent.TUTOR_REJECTED,
    ].includes(event);
  }

  async handle<E extends SystemEvent>(
    event: E,
    payload: EventPayload[E],
  ): Promise<void> {
    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    console.log(`[EmailNotificationHandler] ${event}:`, payload);

    // Example:
    // if (event === SystemEvent.TUTOR_REGISTERED) {
    //   const data = payload as EventPayload[SystemEvent.TUTOR_REGISTERED];
    //   await emailService.send({
    //     to: data.email,
    //     subject: 'Welcome to Kopa360',
    //     template: 'tutor-registration',
    //     data: { firstName: data.firstName }
    //   });
    // }
  }
}

/**
 * Example: WhatsApp Notification Handler
 * (Ready for integration with WhatsApp Business API)
 */
export class WhatsAppNotificationHandler implements NotificationHandler {
  canHandle(event: SystemEvent): boolean {
    return [
      SystemEvent.APPOINTMENT_SCHEDULED,
      SystemEvent.TUTOR_CHECKED_IN,
      SystemEvent.TUTOR_APPROVED,
    ].includes(event);
  }

  async handle<E extends SystemEvent>(
    event: E,
    payload: EventPayload[E],
  ): Promise<void> {
    // TODO: Integrate with WhatsApp Business API
    console.log(`[WhatsAppNotificationHandler] ${event}:`, payload);

    // Example:
    // if (event === SystemEvent.APPOINTMENT_SCHEDULED) {
    //   const data = payload as EventPayload[SystemEvent.APPOINTMENT_SCHEDULED];
    //   await whatsappService.send({
    //     phone: data.tutorPhone,
    //     message: `Appointment scheduled for ${data.scheduledAt}`
    //   });
    // }
  }
}

/**
 * Initialize notification handlers
 */
export function setupNotificationHandlers() {
  const emailHandler = new EmailNotificationHandler();
  const whatsappHandler = new WhatsAppNotificationHandler();

  // Subscribe email handler to relevant events
  eventService.subscribe(SystemEvent.TUTOR_REGISTERED, (payload) =>
    emailHandler.handle(SystemEvent.TUTOR_REGISTERED, payload),
  );
  eventService.subscribe(SystemEvent.APPOINTMENT_SCHEDULED, (payload) =>
    emailHandler.handle(SystemEvent.APPOINTMENT_SCHEDULED, payload),
  );
  eventService.subscribe(SystemEvent.TUTOR_APPROVED, (payload) =>
    emailHandler.handle(SystemEvent.TUTOR_APPROVED, payload),
  );
  eventService.subscribe(SystemEvent.TUTOR_REJECTED, (payload) =>
    emailHandler.handle(SystemEvent.TUTOR_REJECTED, payload),
  );

  // Subscribe WhatsApp handler to relevant events
  eventService.subscribe(SystemEvent.APPOINTMENT_SCHEDULED, (payload) =>
    whatsappHandler.handle(SystemEvent.APPOINTMENT_SCHEDULED, payload),
  );
  eventService.subscribe(SystemEvent.TUTOR_CHECKED_IN, (payload) =>
    whatsappHandler.handle(SystemEvent.TUTOR_CHECKED_IN, payload),
  );
  eventService.subscribe(SystemEvent.TUTOR_APPROVED, (payload) =>
    whatsappHandler.handle(SystemEvent.TUTOR_APPROVED, payload),
  );
}

export default eventService;
