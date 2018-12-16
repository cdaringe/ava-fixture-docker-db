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
const ava_1 = __importDefault(require("ava"));
const __1 = require("../../");
const test = ava_1.default;
test.beforeEach((t) => __awaiter(this, void 0, void 0, function* () {
    yield __1.db.setup(t.context);
}));
test.afterEach((t) => __awaiter(this, void 0, void 0, function* () {
    yield __1.db.teardown(t.context);
}));
test('boots container', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(t.context.dbConfig.username, 'postgres', 'has default postgres user');
    const containerData = yield t.context.dbContainer.inspect();
    t.truthy(containerData.Image, 'has docker image');
    t.is(containerData.State.Status, 'running', 'db is running');
    t.is(Object.keys(containerData.HostConfig.PortBindings).length, 1, 'has host port exposed');
}));
//# sourceMappingURL=use-fixture.test.js.map