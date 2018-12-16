"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const freeport_1 = require("./freeport");
const dockerode_1 = __importDefault(require("dockerode"));
const execa_1 = __importDefault(require("execa"));
const DEFAULT_DB_IMAGE = 'postgres:11-alpine';
const containers = new Set();
const docker = new dockerode_1.default({ socketPath: '/var/run/docker.sock' });
function imageExists(imageName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield execa_1.default('docker', ['image', 'inspect', imageName], { stdio: 'ignore' });
            return true;
        }
        catch (err) {
            // @TODO this is fragile, but dockerode is being a PIA
            return false;
        }
    });
}
exports.imageExists = imageExists;
function purgeContainer(container) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield container.kill();
        }
        finally {
            containers.delete(container);
            try {
                yield container.remove({ force: true });
            }
            catch (err) {
                // if 404, we probably used the --rm flag on container launch. it's all good.
                if (err.statusCode !== 404 && err.statusCode !== 409)
                    throw err;
            }
        }
    });
}
exports.purgeContainer = purgeContainer;
exports.db = {
    setup(ctx, userDbConfig, dockerodeConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const port = yield freeport_1.freeport();
            const image = userDbConfig && userDbConfig.dockerImage
                ? userDbConfig.dockerImage
                : DEFAULT_DB_IMAGE;
            if (!(yield imageExists(DEFAULT_DB_IMAGE))) {
                yield execa_1.default('docker', ['pull', image]);
            }
            const container = yield docker.createContainer(lodash_1.defaultsDeep({}, dockerodeConfig || {}, {
                Image: image,
                ExposedPorts: {
                    '5432/tcp': {}
                },
                HostConfig: {
                    AutoRemove: true,
                    PortBindings: { '5432/tcp': [{ HostPort: port.toString() }] }
                }
            }));
            yield container.start();
            containers.add(container);
            ctx.dbContainer = container;
            const dbConfig = lodash_1.defaultsDeep({}, userDbConfig || {}, {
                port,
                username: 'postgres',
                password: 'postgres',
                database: 'postgres'
            });
            ctx.dbConfig = dbConfig;
            process.on('exit', () => this.teardown(ctx));
        });
    },
    teardown(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const container = ctx.dbContainer;
            if (!container) {
                throw new Error('attempted to kill container, but missing from context');
            }
            yield purgeContainer(container);
        });
    }
};
//# sourceMappingURL=fixture.js.map