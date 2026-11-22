import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { login, logout } from "../src/controllers/auth.controller";
import UserModel from "../src/models/user.model";

const firebaseAuthModule = require("firebase-admin/auth") as {
    getAuth: (app?: unknown) => {
        verifyIdToken: (token: string) => Promise<unknown>;
    };
};

const SECRET = "test-secret";
const USER_ID = "64b000000000000000000002";

const firebaseDecoded = {
    uid: "firebase-uid-123",
    fullname: "Test User",
    email: "test@example.com",
    picture: "https://example.com/pic.png",
};

const existingUser = {
    _id: USER_ID,
    firebaseUid: firebaseDecoded.uid,
    fullname: "Old Name",
    email: "old@example.com",
    profilePicture: null,
};

type MockReq = {
    body: { token?: string };
};

type MockRes = {
    statusCode: number;
    body: unknown;
    cookies: { name: string; value: string; opts: Record<string, unknown> }[];
    cleared: { name: string; opts: Record<string, unknown> }[];
    status: (code: number) => MockRes;
    json: (payload: unknown) => MockRes;
    cookie: (name: string, value: string, opts: Record<string, unknown>) => MockRes;
    clearCookie: (name: string, opts: Record<string, unknown>) => MockRes;
};

function mockReq(body: MockReq["body"] = {}): MockReq {
    return { body };
}

function mockRes(): MockRes {
    const res = {
        statusCode: 0,
        body: null as unknown,
        cookies: [] as MockRes["cookies"],
        cleared: [] as MockRes["cleared"],
        status(code: number) {
            res.statusCode = code;
            return res;
        },
        json(payload: unknown) {
            res.body = payload;
            return res;
        },
        cookie(name: string, value: string, opts: Record<string, unknown>) {
            res.cookies.push({ name, value, opts });
            return res;
        },
        clearCookie(name: string, opts: Record<string, unknown>) {
            res.cleared.push({ name, opts });
            return res;
        },
    };
    return res as MockRes;
}

function mockVerifyIdToken(impl?: () => unknown) {
    mock.method(
        firebaseAuthModule,
        "getAuth",
        () => ({
            verifyIdToken: impl
                ? mock.fn(impl)
                : mock.fn(async () => firebaseDecoded),
        })
    );
}

async function runLogin(req: MockReq) {
    const res = mockRes();
    await login(req as never, res as never);
    return res;
}

beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
    mock.method(console, "log", () => {});
});

afterEach(() => {
    mock.restoreAll();
    process.env.JWT_SECRET = SECRET;
});

test("login returns 400 when firebaseToken is missing", async () => {
    const res = await runLogin(mockReq());

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "token is required." });
    assert.equal(res.cookies.length, 0);
});

test("login returns 400 when verifyIdToken returns falsy", async () => {
    mockVerifyIdToken(() => null);
    const res = await runLogin(mockReq({ token: "some-token" }));

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "Invalid token." });
});

test("login returns 500 when verifyIdToken throws", async () => {
    mockVerifyIdToken(() => {
        throw new Error("firebase token invalid");
    });
    const res = await runLogin(mockReq({ token: "bad-token" }));

    assert.equal(res.statusCode, 500);
    assert.match(String(res.body), /Error occurr during login :firebase token invalid/);
    assert.equal(res.cookies.length, 0);
});

test("login returns 500 when JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;
    mockVerifyIdToken();
    mock.method(UserModel, "findOne", async () => null);
    mock.method(UserModel, "create", async (data: Record<string, unknown>) => ({
        _id: USER_ID,
        ...data,
    }));

    const res = await runLogin(mockReq({ token: "valid-token" }));

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { message: "Server configuration error." });
    assert.equal(res.cookies.length, 0);
});

test("login creates new user, sets cookie and returns token", async () => {
    mockVerifyIdToken();
    mock.method(UserModel, "findOne", async () => null);
    mock.method(UserModel, "create", async (data: Record<string, unknown>) => {
        assert.deepEqual(data, {
            firebaseUid: firebaseDecoded.uid,
            fullname: firebaseDecoded.fullname,
            email: firebaseDecoded.email,
            profilePicture: firebaseDecoded.picture,
        });
        return { _id: USER_ID, ...data };
    });

    const res = await runLogin(mockReq({ token: "valid-token" }));

    assert.equal(res.statusCode, 200);
    const body = res.body as { message: string; user: { _id: string }; token: string };
    assert.equal(body.message, "Login successful");
    assert.equal(String(body.user._id), USER_ID);

    const payload = jwt.verify(body.token, SECRET) as { userId: string };
    assert.equal(String(payload.userId), USER_ID);

    assert.equal(res.cookies.length, 1);
    const cookie = res.cookies[0];
    assert.equal(cookie.name, "token");
    assert.equal(cookie.value, body.token);
    assert.equal(cookie.opts.httpOnly, true);
    assert.equal(cookie.opts.maxAge, 7 * 24 * 60 * 60 * 1000);
});

test("login updates existing user instead of creating", async () => {
    mockVerifyIdToken();
    const createMock = mock.fn();
    mock.method(UserModel, "findOne", async () => existingUser);
    mock.method(UserModel, "create", createMock);
    mock.method(
        UserModel,
        "findByIdAndUpdate",
        async (id: unknown, update: Record<string, unknown>, opts: Record<string, unknown>) => {
            assert.equal(String(id), USER_ID);
            assert.deepEqual(update, {
                fullname: firebaseDecoded.fullname,
                email: firebaseDecoded.email,
                profilePicture: firebaseDecoded.picture,
            });
            assert.deepEqual(opts, { new: true });
            return { _id: id, ...update };
        }
    );

    const res = await runLogin(mockReq({ token: "valid-token" }));

    assert.equal(res.statusCode, 200);
    assert.equal(createMock.mock.callCount(), 0);
    const body = res.body as { user: { fullname: string } };
    assert.equal(body.user.fullname, firebaseDecoded.fullname);
});

test("logout clears token cookie and returns 200", async () => {
    const res = mockRes();
    await logout(mockReq() as never, res as never);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { message: "Logout successful" });
    assert.equal(res.cleared.length, 1);
    assert.equal(res.cleared[0].name, "token");
    assert.equal(res.cleared[0].opts.httpOnly, true);
});

test("logout returns 500 when clearCookie throws", async () => {
    const res = mockRes();
    res.clearCookie = () => {
        throw new Error("cookie failure");
    };

    await logout(mockReq() as never, res as never);

    assert.equal(res.statusCode, 500);
    assert.match(String(res.body), /Error occurred during logout :cookie failure/);
});
