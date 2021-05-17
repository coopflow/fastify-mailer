import Fastify from "fastify";
import {
  createTestAccount,
  SentMessageInfo,
  TestAccount,
  Transporter,
} from "nodemailer";
import { expectAssignable, expectType } from "tsd";
import fastifyMailer, { FastifyMailerNamedInstance } from "../../plugin";

const run: () => Promise<void> = async () => {
  const testAccount: TestAccount = await createTestAccount();
  const app = Fastify();

  app.register(fastifyMailer, {
    defaults: { from: "John Doe <john.doe@example.tld>" },
    transport: {
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    },
  });

  app.ready(() => {
    expectAssignable<Transporter>(app.mailer);

    app.mailer.sendMail(
      {
        to: "someone@example.tld",
        subject: "example",
        text: "hello world !",
      },
      (err, info) => {
        if (err) {
          expectType<Error>(err);
        }
        expectType<SentMessageInfo>(info);
      }
    );

    app.close();
  });

  const appOne = Fastify();

  app.register(fastifyMailer, {
    defaults: { from: "John Doe <john.doe@example.tld>" },
    transport: {
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    },
    namespace: "one",
  });

  appOne.ready(() => {
    expectAssignable<FastifyMailerNamedInstance>(appOne.mailer);
    expectType<Transporter>(appOne.mailer.one);

    appOne.mailer.one.sendMail(
      {
        to: "someone@example.tld",
        subject: "example",
        text: "hello world !",
      },
      (err, info) => {
        if (err) {
          expectType<Error>(err);
        }
        expectType<SentMessageInfo>(info);
      }
    );

    appOne.close();
  });
};

run().catch(console.error);
