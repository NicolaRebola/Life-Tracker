import { ResendMessageAdapter } from 'src/modules/events/infrastructure/messaging/resend-message.adapter';
import type { SendableMessage } from 'src/modules/events/application/ports/outbound/message-channel-adapter.port';
import type { ResendEmailClient } from 'src/modules/events/infrastructure/messaging/resend-message.adapter';
import type { CreateEmailOptions, CreateEmailRequestOptions } from 'resend';

describe('ResendMessageAdapter', () => {
  const originalEnv = process.env;
  let send: jest.Mock;
  let client: ResendEmailClient;

  const message: SendableMessage = {
    id: 'message-1',
    channel: 'EMAIL',
    messageType: 'EVENT_INVITATION',
    payload: {
      to: 'guest@example.com',
      subject: 'Invitacion a Evento',
      template: 'event-invitation',
      variables: {
        eventId: 'event-1',
        eventName: 'Evento',
        invitedByName: 'Life Tracker',
        invitationUrl: 'https://app.example.com/event-invitations/token',
        expiresAt: '2026-06-09T10:00:00.000Z',
      },
    },
  };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      RESEND_FROM_EMAIL: 'Life Tracker <noreply@example.com>',
    };
    send = jest.fn();
    client = { emails: { send } };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('sends event invitation emails through Resend', async () => {
    send.mockResolvedValue({
      data: { id: 'resend-message-1' },
      error: null,
      headers: null,
    });

    const result = await new ResendMessageAdapter(client).send(message);

    expect(result).toEqual({
      ok: true,
      providerMessageId: 'resend-message-1',
    });
    const [payload, options] = send.mock.calls[0] as [
      CreateEmailOptions,
      CreateEmailRequestOptions,
    ];
    expect(payload.from).toBe('Life Tracker <noreply@example.com>');
    expect(payload.to).toBe('guest@example.com');
    expect(payload.subject).toBe('Invitacion a Evento');
    expect(payload.html).toContain('Aceptar invitacion');
    expect(payload.text).toContain(
      'https://app.example.com/event-invitations/token',
    );
    expect(options).toEqual({ idempotencyKey: 'event-invitation/message-1' });
  });

  it('maps Resend rate limit errors as transient failures', async () => {
    send.mockResolvedValue({
      data: null,
      error: {
        name: 'rate_limit_exceeded',
        message: 'Too many requests',
        statusCode: 429,
      },
      headers: null,
    });

    const result = await new ResendMessageAdapter(client).send(message);

    expect(result).toEqual({
      ok: false,
      failureKind: 'TRANSIENT',
      errorCode: 'rate_limit_exceeded',
      message: 'Too many requests',
    });
  });

  it('maps Resend validation errors as permanent failures', async () => {
    send.mockResolvedValue({
      data: null,
      error: {
        name: 'validation_error',
        message: 'Invalid recipient',
        statusCode: 422,
      },
      headers: null,
    });

    const result = await new ResendMessageAdapter(client).send(message);

    expect(result).toEqual({
      ok: false,
      failureKind: 'PERMANENT',
      errorCode: 'validation_error',
      message: 'Invalid recipient',
    });
  });
});
