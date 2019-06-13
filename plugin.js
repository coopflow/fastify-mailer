'use strict'

const fp = require('fastify-plugin')
const { createTransport } = require('nodemailer')

function fastifyMailer (fastify, options, next) {
  if (!options.transport) {
    return next(new Error('You must provide a valid transport configuration object, connection url or a transport plugin instance'))
  }

  const defaults = options.defaults || null
  delete options.defaults

  const namespace = options.namespace
  delete options.namespace

  let transport = options.transport
  delete options.transport

  try {
    if (!defaults) {
      transport = createTransport(transport)
    } else {
      transport = createTransport(transport, defaults)
    }
  } catch (error) {
    return next(error)
  }

  if (namespace) {
    if (!fastify.mailer) {
      fastify.decorate('mailer', {})
    }

    if (fastify.mailer[namespace]) {
      return next(
        new Error(`fastify-mailer '${namespace}' instance name has already been registered`)
      )
    }

    const closeNamedInstance = (fastify, done) => {
      fastify.mailer[namespace].close(done)
    }

    fastify.mailer[namespace] = transport
    fastify.addHook('onClose', closeNamedInstance)
  } else {
    if (fastify.mailer) {
      return next(new Error('fastify-mailer has already been registered'))
    } else {
      fastify.decorate('mailer', transport)
      fastify.addHook('onClose', close)
    }
  }

  next()
}

function close (fastify, done) {
  fastify.mailer.close(done)
}

module.exports = fp(fastifyMailer, {
  fastify: '>=2.0.0',
  name: 'fastify-mailer'
})
