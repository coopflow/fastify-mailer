import { FastifyPluginCallback } from 'fastify';
import { Transporter } from 'nodemailer';
import SMTPTransport = require('nodemailer/lib/smtp-transport');

declare module 'fastify' {
  interface FastifyInstance {
    mailer: Transporter;
  }
}

export type FastifyMailerPlugin = {
  transport: SMTPTransport | SMTPTransport.Options | string;
  defaults?: SMTPTransport;
  namespace?: string;
};

declare const fastifyMailer: FastifyPluginCallback<FastifyMailerPlugin>;

export default fastifyMailer;