'use strict'

const fp = require('fastify-plugin')

function fastifyMailer (fastify, options, next) {
  next()
}

module.exports = fp(fastifyMailer, {
  fastify: '>=2.4.1',
  name: 'fastify-mailer'
})
