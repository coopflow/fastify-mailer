import fastify from 'fastify';
import fastifyMailer from '..';

const server = fastify();

server.register(fastifyMailer, {
    transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    }
});

server.listen(3000, (err, address) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    server.mailer.sendMail({
        from: 'no-reply@mail.com',
        to: 'user@gmail.com',
        subject: 'Test Mail',
        text: 'This is a sample email.',
        html: '<b>This is a sample <i>html</i> email</b>'
    });
});
