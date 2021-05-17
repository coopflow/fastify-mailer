import { FastifyPluginCallback } from "fastify";
import { Transport, Transporter, TransportOptions } from "nodemailer";
import JSONTransport from "nodemailer/lib/json-transport";
import SendmailTransport from "nodemailer/lib/sendmail-transport";
import SESTransport from "nodemailer/lib/ses-transport";
import SMTPPool from "nodemailer/lib/smtp-pool";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import StreamTransport from "nodemailer/lib/stream-transport";

export interface FastifyMailerOptions {
  defaults?:
    | JSONTransport.Options
    | SendmailTransport.Options
    | SESTransport.Options
    | SMTPPool.Options
    | SMTPTransport.Options
    | StreamTransport.Options
    | TransportOptions;
  transport:
    | JSONTransportConfig
    | SendmailTransportConfig
    | SESTransportConfig
    | SMTPPoolTransportConfig
    | SMTPTransportConfig
    | StreamTransportConfig
    | CustomTransportConfig;
  /**
   * fastify-mailer instance namespace
   */
  namespace?: string;
}

export type CustomTransportConfig = Transport | TransportOptions;
export type JSONTransportConfig = JSONTransport | JSONTransport.Options;
export type SendmailTransportConfig =
  | SendmailTransport
  | SendmailTransport.Options;
export type SESTransportConfig = SESTransport | SESTransport.Options;
export type SMTPTransportConfig =
  | SMTPTransport
  | SMTPTransport.Options
  | string;
export type SMTPPoolTransportConfig = SMTPPool | SMTPPool.Options;
export type StreamTransportConfig = StreamTransport | StreamTransport.Options;

export interface FastifyMailerNamedInstance {
  [namespace: string]: Transporter;
}

export type FastifyMailer = FastifyMailerNamedInstance & Transporter;

declare module "fastify" {
  interface FastifyInstance {
    mailer: FastifyMailer;
  }
}

export const FastifyMailerPlugin: FastifyPluginCallback<FastifyMailerOptions>;
export default FastifyMailerPlugin;
