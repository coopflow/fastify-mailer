# fastify-mailer

[![NPM version](https://img.shields.io/npm/v/fastify-mailer.svg?style=flat)](https://www.npmjs.com/package/fastify-mailer)
[![GitHub CI](https://github.com/coopflow/fastify-mailer/workflows/GitHub%20CI/badge.svg)](https://github.com/coopflow/fastify-mailer/actions?workflow=GitHub+CI)
[![Coverage Status](https://coveralls.io/repos/github/coopflow/fastify-mailer/badge.svg?branch=master)](https://coveralls.io/github/coopflow/fastify-mailer?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

[Nodemailer](https://www.nodemailer.com) instance initialization and encapsulation in [fastify](https://www.github.com/fastify/fastify) framework.

## Install

Install the package with:

```sh
npm i fastify-mailer nodemailer --save
```

## Usage

The package needs to be added to your project with `register` and you must at least configure your transporter options following [Nodemailer documentation](https://nodemailer.com/usage/) and you are done.

```js
'use strict'

const fastify = require('fastify')({ logger: true })

fastify.register(require('fastify-mailer'), {
  defaults: { from: 'John Doe <john.doe@example.tld>' },
  transport: {
    host: 'smtp.example.tld',
    port: 465,
    secure: true, // use TLS
    auth: {
      user: 'john.doe',
      pass: 'super strong password'
    }
  }
})

fastify.get('/send', (request, reply) => {
  const { mailer } = fastify

  mailer.sendMail({
    to: 'someone@example.tld',
    subject: 'example',
    text: 'hello world !'
  }, (errors, info) => {
    if (errors) {
      fastify.log.error(errors)

      reply.status(500)
      return {
        status: 'error',
        message: 'Something went wrong'
      }
    }

    reply.status(200)
    return {
      status: 'ok',
      message: 'Email successfully sent',
      info: {
        from: info.from, // John Doe <john.doe@example.tld>
        to: info.to, // ['someone@example.tld']
      }
    }
  })
})

fastify.listen(3000, (errors) => {
  if (errors) {
    fastify.log.error(errors)
    process.exit(1)
  }
})
```

## Options

- `defaults`: is an *optional* object that defines default values for mail options.

#### example:

```js
'use strict'

const fastify = require('fastify')({ logger: true })

fastify.register(require('fastify-mailer'), {
  defaults: {
    // set the default sender email address to jane.doe@example.tld
    from: 'Jane Doe <jane.doe@example.tld>',
    // set the default email subject to 'default example'
    subject: 'default example',
  },
  transport: {
    host: 'smtp.example.tld',
    port: 465,
    secure: true, // use TLS
    auth: {
      user: 'jane.doe',
      pass: 'super strong password'
    }
  }
})

fastify.get('/send', (request, reply) => {
  const { mailer } = fastify

  mailer.sendMail({
    to: 'someone@example.tld',
    text: 'hello world !'
  }, (errors, info) => {
    if (errors) {
      fastify.log.error(errors)

      reply.status(500)
      return {
        status: 'error',
        message: 'Something went wrong'
      }
    }

    reply.status(200)
    return {
      status: 'ok',
      message: 'Email successfully sent',
      info: {
        from: info.from, // Jane Doe <jane.doe@example.tld>
        to: info.to, // ['someone@example.tld']
      }
    }
  })
})

fastify.listen(3000, (errors) => {
  if (errors) {
    fastify.log.error(errors)
    process.exit(1)
  }
})
```

- `namespace`: is an *optional* string that lets you define multiple namespaced transporter instances (with different options parameters if you wish) that you can later use in your application.

#### example:

```js
'use strict'

const fastify = require('fastify')({ logger: true })

fastify
  .register(require('fastify-mailer'), {
    defaults: {
      // set the default sender email address to jane.doe@example.tld
      from: 'Jane Doe <jane.doe@example.tld>',
      // set the default email subject to 'default example'
      subject: 'default example',
    },
    namespace: 'jane',
    transport: {
      host: 'smtp.example.tld',
      port: 465,
      secure: true, // use TLS
      auth: {
        user: 'jane.doe',
        pass: 'super strong password for jane'
      }
    }
  })
  .register(require('fastify-mailer'), {
    defaults: { from: 'John Doe <john.doe@example.tld>' },
    namespace: 'john',
    transport: {
      pool: true,
      host: 'smtp.example.tld',
      port: 587,
      secure: false,
      auth: {
        user: 'john.doe',
        pass: 'super strong password for john'
      }
    }
  })

fastify.get('/sendwithjane', (request, reply) => {
  const { mailer } = fastify

  mailer.jane.sendMail({
    to: 'someone@example.tld',
    text: 'hello world !'
  }, (errors, info) => {
    if (errors) {
      fastify.log.error(errors)

      reply.status(500)
      return {
        status: 'error',
        message: 'Something went wrong'
      }
    }

    reply.status(200)
    return {
      status: 'ok',
      message: 'Email successfully sent',
      info: {
        from: info.from, // Jane Doe <jane.doe@example.tld>
        to: info.to, // ['someone@example.tld']
      }
    }
  })
})


fastify.get('/sendwithjohn', (request, reply) => {
  const { mailer } = fastify

  mailer.john.sendMail({
    to: 'someone@example.tld',
    subject: 'example with john',
    text: 'hello world !'
  }, (errors, info) => {
    if (errors) {
      fastify.log.error(errors)

      reply.status(500)
      return {
        status: 'error',
        message: 'Something went wrong'
      }
    }

    reply.status(200)
    return {
      status: 'ok',
      message: 'Email successfully sent',
      info: {
        from: info.from, // John Doe <john.doe@example.tld>
        to: info.to, // ['someone@example.tld']
      }
    }
  })
})

fastify.listen(3000, (errors) => {
  if (errors) {
    fastify.log.error(errors)
    process.exit(1)
  }
})
```

- `transport`: is a *required* transport configuration object, connection url or a transport plugin instance.

#### example using SES transport:

```js
'use strict'

const fastify = require('fastify')({ logger: true })
const aws = require('@aws-sdk/client-ses')

/**
 * configure AWS SDK:
 *
 * Use environment variables or Secrets as a Service solutions
 * to store your secrets.
 *
 * NB: do not hardcode your secrets !
 */
process.env.AWS_ACCESS_KEY_ID = 'aws_access_key_id_here'
process.env.AWS_SECRET_ACCESS_KEY = 'aws_secret_access_key_here'

const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1'
})

fastify.register(require('fastify-mailer'), {
  defaults: { from: 'John Doe <john.doe@example.tld>' },
  transport: {
    SES: { ses, aws }
  }
})

fastify.get('/send', (request, reply) => {
  const { mailer } = fastify

  mailer.sendMail({
    to: 'someone@example.tld',
    subject: 'example',
    text: 'hello world !',
    ses: {
      // optional extra arguments for SendRawEmail
      Tags: [
        {
          Name: 'foo',
          Value: 'bar'
        }
      ]
    }
  }, (errors, info) => {
    if (errors) {
      fastify.log.error(errors)

      reply.status(500)
      return {
        status: 'error',
        message: 'Something went wrong'
      }
    }

    reply.status(200)
    return {
      status: 'ok',
      message: 'Email successfully sent',
      info: {
        envelope: info.envelope, // {"from":"John Doe <john.doe@example.tld>","to":['someone@example.tld']}
      }
    }
  })
})

fastify.listen(3000, (errors) => {
  if (errors) {
    fastify.log.error(errors)
    process.exit(1)
  }
})
```

For more information on transports you can take a look at [Nodemailer dedicated documentation](https://nodemailer.com/transports/).

## Typescript users

Types for nodemailer are not officially supported by its author Andris Reinman.

If you want to use the DefinitelyTyped community maintained types:
- first you need to install the package with :
```shell
npm install -D @types/nodemailer
```
- then you must re-declare the `mailer` interface in the `fastify` module within your own code to add the properties you expect.

#### example :

```ts
import { Transporter } from "nodemailer";

export interface FastifyMailerNamedInstance {
  [namespace: string]: Transporter;
}
export type FastifyMailer = FastifyMailerNamedInstance & Transporter;

declare module "fastify" {
  interface FastifyInstance {
    mailer: FastifyMailer;
  }
}
```

## Documentation

See [Nodemailer documentation](https://nodemailer.com/about/).

## Acknowledgements

This project is kindly sponsored by [coopflow](https://www.coopflow.com).

## License

Licensed under [MIT](https://github.com/coopflow/fastify-mailer/blob/master/LICENSE)
