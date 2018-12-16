import { defaultsDeep } from 'lodash'
import { freeport } from './freeport'
import Docker from 'dockerode'
import execa from 'execa'

const DEFAULT_DB_IMAGE = 'postgres:11-alpine'

export interface DbContextDbConfig {
  dockerImage: string
  port: number
  username: 'postgres'
  password: 'postgres'
  database: 'postgres'
}

export interface DbContext {
  dbContainer: Docker.Container
  dbConfig: DbContextDbConfig
}

const containers = new Set()
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

export async function imageExists (imageName: string) {
  try {
    await execa('docker', ['image', 'inspect', imageName], { stdio: 'ignore' })
    return true
  } catch (err) {
    // @TODO this is fragile, but dockerode is being a PIA
    return false
  }
}

export async function purgeContainer (container: Docker.Container) {
  try {
    await container.kill()
  } finally {
    containers.delete(container)
    try {
      await container.remove({ force: true })
    } catch (err) {
      // if 404, we probably used the --rm flag on container launch. it's all good.
      if (err.statusCode !== 404 && err.statusCode !== 409) throw err
    }
  }
}

export const db = {
  async setup<C> (
    ctx: C & DbContext,
    userDbConfig?: DbContextDbConfig,
    dockerodeConfig?: Docker.ContainerCreateOptions
  ): Promise<void> {
    const port = await freeport()
    const image =
      userDbConfig && userDbConfig.dockerImage
        ? userDbConfig.dockerImage
        : DEFAULT_DB_IMAGE
    if (!await imageExists(DEFAULT_DB_IMAGE)) {
      await execa('docker', ['pull', image])
    }
    const container = await docker.createContainer(
      defaultsDeep({}, dockerodeConfig || {}, {
        Image: image,
        ExposedPorts: {
          '5432/tcp': {}
        },
        HostConfig: {
          AutoRemove: true,
          PortBindings: { '5432/tcp': [{ HostPort: port.toString() }] }
        }
      })
    )
    await container.start()
    containers.add(container)
    ctx.dbContainer = container
    const dbConfig: Partial<DbContextDbConfig> = defaultsDeep(
      {},
      userDbConfig || {},
      {
        port,
        username: 'postgres',
        password: 'postgres',
        database: 'postgres'
      }
    )
    ctx.dbConfig = dbConfig as DbContextDbConfig
    process.on('exit', () => this.teardown(ctx))
  },
  async teardown (ctx: DbContext) {
    const container: Docker.Container = ctx.dbContainer
    if (!container) {
      throw new Error('attempted to kill container, but missing from context')
    }
    await purgeContainer(container)
  }
}
