'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyMailer = require('../plugin')

test('fastify.mailer namespace should exist', (t) => {
  t.plan(3)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMailer, {
    transport: { jsonTransport: true }
  })

  fastify.ready((err) => {
    t.error(err)
    t.ok(fastify.mailer)
    t.ok(fastify.mailer.sendMail)
  })
})

test('fastify.mailer.test namespace should exist', (t) => {
  t.plan(3)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMailer, {
    namespace: 'test',
    transport: { jsonTransport: true }
  })

  fastify.ready((err) => {
    t.error(err)
    t.ok(fastify.mailer.test)
    t.ok(fastify.mailer.test.sendMail)
  })
})

test('fastify.mailer.test should throw with duplicate namespaces', (t) => {
  t.plan(1)

  const fastify = Fastify()
  const namespace = 'test'
  t.teardown(() => fastify.close())

  fastify
    .register(fastifyMailer, {
      namespace,
      transport: { jsonTransport: true }
    })
    .register(fastifyMailer, {
      namespace,
      transport: { jsonTransport: true }
    })

  fastify.ready((errors) => {
    t.is(errors.message, `fastify-mailer '${namespace}' instance name has already been registered`)
  })
})

test('Should not throw if registered within different scopes (with and without namespaced instances)', (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(function scopeOne (instance, opts, next) {
    instance.register(fastifyMailer, {
      transport: { jsonTransport: true }
    })

    next()
  })

  fastify.register(function scopeTwo (instance, opts, next) {
    instance.register(fastifyMailer, {
      namespace: 'test',
      transport: { jsonTransport: true }
    })

    instance.register(fastifyMailer, {
      namespace: 'anotherTest',
      transport: { jsonTransport: true }
    })

    next()
  })

  fastify.ready((errors) => {
    t.error(errors)
    t.is(errors, null)
  })
})

test('Should throw when trying to register multiple instances without giving a namespace', (t) => {
  t.plan(1)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify
    .register(fastifyMailer, {
      transport: { jsonTransport: true }
    })
    .register(fastifyMailer, {
      transport: { jsonTransport: true }
    })

  fastify.ready((errors) => {
    t.is(errors.message, `fastify-mailer has already been registered`)
  })
})

test('Should throw on bad transporter initialization', (t) => {
  t.plan(1)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMailer, {
    transport: 'this will trigger a throw'
  })

  fastify.ready((errors) => {
    t.is(errors.message, `Cannot create property 'mailer' on string 'this will trigger a throw'`)
  })
})

test('Should throw on bad custom transporter initialization', (t) => {
  t.plan(1)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMailer, { transport: 'this will trigger a throw' })

  fastify.ready((errors) => {
    t.is(errors.message, `Cannot create property 'mailer' on string 'this will trigger a throw'`)
  })
})

test('Should throw if initialized without a transporter', (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMailer, {
    defaults: { from: 'john@doe.tld' }
  })

  fastify.ready((errors) => {
    t.ok(errors)
    t.is(errors.message, 'You must provide a valid transport configuration object, connection url or a transport plugin instance')
  })
})

test('Should be able to use `sendMail()` method with a singular fastify-mailer instance', (t) => {
  t.plan(6)

  const email = {
    from: 'john@doe.tld',
    to: 'jane@doe.tld',
    subject: 'test',
    text: 'hello world'
  }

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMailer, {
    transport: { jsonTransport: true }
  })

  fastify.ready((errors) => {
    t.error(errors)

    const { mailer } = fastify

    mailer.sendMail(email, (errors, info) => {
      t.error(errors)

      t.strictEqual(info.envelope.from, email.from)
      t.strictEqual(info.envelope.to[0], email.to)
      t.ok(info.message.indexOf(`"subject":"${email.subject}"`))
      t.ok(info.message.indexOf(`"text":"${email.text}"`))
    })
  })
})

test('Should be able to use `sendMail()` method with multiple namespaced fastify-mailer instances', (t) => {
  t.plan(11)

  const email = {
    from: 'john@doe.tld',
    to: 'jane@doe.tld',
    subject: 'test',
    text: 'hello world'
  }

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify
    .register(fastifyMailer, {
      namespace: 'test',
      transport: { jsonTransport: true }
    })
    .register(fastifyMailer, {
      namespace: 'anotherTest',
      transport: { jsonTransport: true }
    })

  fastify.ready((errors) => {
    t.error(errors)

    const { mailer } = fastify

    mailer.test.sendMail(email, (errors, info) => {
      t.error(errors)

      t.strictEqual(info.envelope.from, email.from)
      t.strictEqual(info.envelope.to[0], email.to)
      t.ok(info.message.indexOf(`"subject":"${email.subject}"`))
      t.ok(info.message.indexOf(`"text":"${email.text}"`))
    })

    mailer.anotherTest.sendMail(email, (errors, info) => {
      t.error(errors)

      t.strictEqual(info.envelope.from, email.from)
      t.strictEqual(info.envelope.to[0], email.to)
      t.ok(info.message.indexOf(`"subject":"${email.subject}"`))
      t.ok(info.message.indexOf(`"text":"${email.text}"`))
    })
  })
})

test('Should be able to use `sendMail()` method with a custom defined transporter', (t) => {
  t.plan(5)

  const fastify = Fastify()
  t.tearDown(() => fastify.close())

  // Inspired by: https://nodemailer.com/plugins/create/#transports
  const customTransporter = {
    name: 'custom',
    version: '0.0.1',
    send: (mail, callback) => {
      const envelope = mail.message.getEnvelope()
      const messageId = mail.message.messageId()

      callback(null, {
        envelope,
        messageId
      })
    }
  }

  fastify.register(fastifyMailer, { transport: customTransporter })

  fastify.ready((errors) => {
    t.error(errors)

    const email = {
      from: 'john@doe.tld',
      to: 'jane@doe.tld',
      subject: 'custom transporter',
      text: 'hello world'
    }

    const { mailer } = fastify

    mailer.sendMail(email, (errors, info) => {
      t.error(errors)

      t.strictEqual(info.envelope.from, email.from)
      t.strictEqual(info.envelope.to[0], email.to)

      t.match(info.messageId, /^<[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}@doe.tld>$/)
    })
  })
})

test('Should be able to use `sendMail()` with initialized defaults', (t) => {
  t.plan(6)

  const email = {
    to: 'jane@doe.tld',
    subject: 'test',
    text: 'hello world'
  }

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(fastifyMailer, {
    defaults: { from: 'john@doe.tld' },
    transport: { jsonTransport: true }
  })

  fastify.ready((errors) => {
    t.error(errors)

    const { mailer } = fastify

    mailer.sendMail(email, (errors, info) => {
      t.error(errors)

      t.strictEqual(info.envelope.from, 'john@doe.tld')
      t.strictEqual(info.envelope.to[0], email.to)
      t.ok(info.message.indexOf(`"subject":"${email.subject}"`))
      t.ok(info.message.indexOf(`"text":"${email.text}"`))
    })
  })
})
