import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { requireAuth } from "../src/middlewares/auth.middleware";
import UserModel from "../src/models/user.model";

const SECRET = "test-secret";
const USER_ID = "64b000000000000000000001";

const fakeUser = {
    _id: USER_ID,
    fullname: "Test User",
    email: "test@example.com",
    profilePicture: null,
};

type MockReq = {
    cookies?: Record<string, string>;
    headers: Record<string, string | undefined>;
    user?: unknown;
};

function mockReq(overrides: Partial<MockReq> = {}): MockReq {
    return {
        cookies: {},
        headers: {},
        ...overrides,
    };
}

function mockRes() {
    const res = {
        statusCode: 0,
        body: null as { message?: string } | null,
        status(code: number) {
            res.statusCode = code;
            return res;
        },
        json(payload: { message?: string }) {
            res.body = payload;
            return res;
        },
    };
    return res;
}

async function run(req: MockReq) {
    const res = mockRes();
    const next = mock.fn();
    await requireAuth(
        req as never,
        res as never,
        next as never
    );
    return { res, next };
}

beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
    mock.method(console, "log", () => {});
});

afterEach(() => {
    mock.restoreAll();
    process.env.JWT_SECRET = SECRET;
});

test("401 when no token is provided", async () => {
    const { res, next } = await run(mockReq());

    assert.equal(res.statusCode, 401);
    assert.equal(res.body?.message, "Authentication required.");
    assert.equal(next.mock.callCount(), 0);
});

test("401 when Authorization header has no Bearer token", async () => {
    const { res, next } = await run(mockReq({ headers: { authorization: "Basic abc" } }));

    assert.equal(res.statusCode, 401);
    assert.equal(next.mock.callCount(), 0);
});

test("500 when JWT_SECRET is not defined", async () => {
    delete process.env.JWT_SECRET;
    const token = jwt.sign({ userId: USER_ID }, SECRET);
    const { res, next } = await run(mockReq({ cookies: { token } }));

    assert.equal(res.statusCode, 500);
    assert.equal(res.body?.message, "Server configuration error.");
    assert.equal(next.mock.callCount(), 0);
});

test("401 when token is garbage", async () => {
    const { res, next } = await run(mockReq({ cookies: { token: "not-a-jwt" } }));

    assert.equal(res.statusCode, 401);
    assert.equal(res.body?.message, "Invalid or expired token.");
    assert.equal(next.mock.callCount(), 0);
});

test("401 when token is expired", async () => {
    const token = jwt.sign(
        { userId: USER_ID, exp: Math.floor(Date.now() / 1000) - 60 },
        SECRET
    );
    const { res, next } = await run(mockReq({ cookies: { token } }));

    assert.equal(res.statusCode, 401);
    assert.equal(res.body?.message, "Invalid or expired token.");
    assert.equal(next.mock.callCount(), 0);
});

test("401 when token has no userId", async () => {
    const token = jwt.sign({ foo: "bar" }, SECRET);
    const { res, next } = await run(mockReq({ cookies: { token } }));

    assert.equal(res.statusCode, 401);
    assert.equal(res.body?.message, "Invalid token.");
    assert.equal(next.mock.callCount(), 0);
});

test("401 when user does not exist in DB", async () => {
    mock.method(UserModel, "findById", async () => null);
    const token = jwt.sign({ userId: USER_ID }, SECRET);
    const { res, next } = await run(mockReq({ cookies: { token } }));

    assert.equal(res.statusCode, 401);
    assert.equal(res.body?.message, "User not found.");
    assert.equal(next.mock.callCount(), 0);
});

test("sets req.user and calls next for valid cookie token", async () => {
    mock.method(UserModel, "findById", async () => fakeUser);
    const token = jwt.sign({ userId: USER_ID }, SECRET);
    const req = mockReq({ cookies: { token } });
    const { res, next } = await run(req);

    assert.equal(next.mock.callCount(), 1);
    assert.equal(res.statusCode, 0);
    assert.deepEqual(req.user, {
        id: USER_ID,
        fullname: "Test User",
        email: "test@example.com",
        profilePicture: null,
    });
});

test("accepts token from Authorization Bearer header", async () => {
    mock.method(UserModel, "findById", async () => fakeUser);
    const token = jwt.sign({ userId: USER_ID }, SECRET);
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const { next } = await run(req);

    assert.equal(next.mock.callCount(), 1);
    assert.equal((req.user as { id: string }).id, USER_ID);
});

test("cookie token works when both cookie and header present", async () => {
    mock.method(UserModel, "findById", async () => fakeUser);
    const cookieToken = jwt.sign({ userId: USER_ID }, SECRET);
    const headerToken = jwt.sign({ userId: "someone-else" }, SECRET);
    const req = mockReq({
        cookies: { token: cookieToken },
        headers: { authorization: `Bearer ${headerToken}` },
    });
    const { next } = await run(req);

    assert.equal(next.mock.callCount(), 1);
    assert.equal((req.user as { id: string }).id, USER_ID);
});

test("401 when findById throws", async () => {
    mock.method(UserModel, "findById", async () => {
        throw new Error("db down");
    });
    const token = jwt.sign({ userId: USER_ID }, SECRET);
    const { res, next } = await run(mockReq({ cookies: { token } }));

    assert.equal(res.statusCode, 401);
    assert.equal(res.body?.message, "Invalid or expired token.");
    assert.equal(next.mock.callCount(), 0);
});
