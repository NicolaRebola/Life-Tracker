import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import type {
  CreateEmailOptions,
  CreateEmailRequestOptions,
  CreateEmailResponse,
  ErrorResponse,
} from 'resend';
import type {
  MessageChannelAdapter,
  MessageSendResult,
  SendableMessage,
} from '../../application/ports/outbound/message-channel-adapter.port';

export type ResendEmailClient = {
  emails: {
    send(
      payload: CreateEmailOptions,
      options?: CreateEmailRequestOptions,
    ): Promise<CreateEmailResponse>;
  };
};

type InvitationVariables = {
  eventName: string;
  invitedByName: string;
  invitationUrl: string;
  expiresAt: string;
};

const TRANSIENT_RESEND_ERRORS = new Set([
  'application_error',
  'concurrent_idempotent_requests',
  'internal_server_error',
  'rate_limit_exceeded',
]);

@Injectable()
export class ResendMessageAdapter implements MessageChannelAdapter {
  private readonly client: ResendEmailClient;
  private readonly fromEmail: string;

  constructor(client?: ResendEmailClient) {
    this.client = client ?? new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_EMAIL ?? '';
  }

  async send(message: SendableMessage): Promise<MessageSendResult> {
    if (message.channel !== 'EMAIL') {
      return this.permanentFailure(
        'unsupported_channel',
        `Unsupported message channel: ${message.channel}`,
      );
    }

    if (message.messageType !== 'EVENT_INVITATION') {
      return this.permanentFailure(
        'unsupported_message_type',
        `Unsupported email message type: ${message.messageType}`,
      );
    }

    if (!this.fromEmail) {
      return this.permanentFailure(
        'missing_from_email',
        'RESEND_FROM_EMAIL is not configured',
      );
    }

    const to = this.getString(message.payload.to);
    const subject = this.getString(message.payload.subject);
    const variables = this.getInvitationVariables(message.payload.variables);

    if (!to || !subject || !variables) {
      return this.permanentFailure(
        'invalid_payload',
        'Email invitation payload is incomplete',
      );
    }

    const { data, error } = await this.client.emails.send(
      {
        from: this.fromEmail,
        to,
        subject,
        html: this.renderInvitationHtml(variables),
        text: this.renderInvitationText(variables),
      },
      { idempotencyKey: `event-invitation/${message.id}` },
    );

    if (error) {
      return this.mapResendError(error);
    }

    return {
      ok: true,
      providerMessageId: data.id,
    };
  }

  private getInvitationVariables(
    value: unknown,
  ): InvitationVariables | undefined {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const variables = value as Record<string, unknown>;
    const eventName = this.getString(variables.eventName);
    const invitedByName = this.getString(variables.invitedByName);
    const invitationUrl = this.getString(variables.invitationUrl);
    const expiresAt = this.getString(variables.expiresAt);

    if (!eventName || !invitedByName || !invitationUrl || !expiresAt) {
      return undefined;
    }

    return {
      eventName,
      invitedByName,
      invitationUrl,
      expiresAt,
    };
  }

  private getString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private mapResendError(error: ErrorResponse): MessageSendResult {
    const failureKind =
      TRANSIENT_RESEND_ERRORS.has(error.name) ||
      (error.statusCode !== null && error.statusCode >= 500)
        ? 'TRANSIENT'
        : 'PERMANENT';

    return {
      ok: false,
      failureKind,
      errorCode: error.name,
      message: error.message,
    };
  }

  private permanentFailure(
    errorCode: string,
    message: string,
  ): MessageSendResult {
    return {
      ok: false,
      failureKind: 'PERMANENT',
      errorCode,
      message,
    };
  }

  private renderInvitationHtml(variables: InvitationVariables): string {
    const eventName = this.escapeHtml(variables.eventName);
    const invitedByName = this.escapeHtml(variables.invitedByName);
    const invitationUrl = this.escapeHtml(variables.invitationUrl);
    const expiresAt = this.escapeHtml(variables.expiresAt);

    return `
      <main style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h1>Invitacion a ${eventName}</h1>
        <p>${invitedByName} te invito a participar del evento "${eventName}" en Life Tracker.</p>
        <p>
          <a href="${invitationUrl}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Aceptar invitacion
          </a>
        </p>
        <p>Este enlace vence el ${expiresAt}.</p>
      </main>
    `.trim();
  }

  private renderInvitationText(variables: InvitationVariables): string {
    return [
      `Invitacion a ${variables.eventName}`,
      '',
      `${variables.invitedByName} te invito a participar del evento "${variables.eventName}" en Life Tracker.`,
      '',
      `Acepta la invitacion desde: ${variables.invitationUrl}`,
      '',
      `Este enlace vence el ${variables.expiresAt}.`,
    ].join('\n');
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
