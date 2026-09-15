const assert = require("assert");
const app = require("../server");

// Simple harness to test Express app request/response without binding a network port
const makeRequest = (method, url, body = null, headers = {}) => {
  return new Promise((resolve) => {
    const req = Object.assign(new (require("events").EventEmitter)(), {
      method,
      url,
      headers: Object.assign({ "content-type": "application/json" }, headers),
      body,
    });

    const res = Object.assign(new (require("events").EventEmitter)(), {
      statusCode: 200,
      headers: {},
      setHeader(k, v) {
        this.headers[k.toLowerCase()] = v;
      },
      getHeader(k) {
        return this.headers[k.toLowerCase()];
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        resolve({ statusCode: this.statusCode, data });
      },
      end() {
        resolve({ statusCode: this.statusCode, data: null });
      },
    });

    app(req, res);
    if (body) {
      req.emit("data", JSON.stringify(body));
      req.emit("end");
    }
  });
};

async function runAuthTests() {
  console.log("=== Running Authentication Regression Tests ===");

  // 1. Valid Admin Login
  const adminRes = await makeRequest("POST", "/api/auth/login", {
    email: "admin@sms.com",
    password: "admin123",
  });
  assert.strictEqual(adminRes.statusCode, 200, "Admin login should return HTTP 200");
  assert.strictEqual(adminRes.data.role, "admin", "Admin role should be 'admin'");
  assert.ok(adminRes.data.token, "Admin login should return JWT token");
  console.log("✓ Valid Admin Login Passed");

  // 2. Valid Faculty Login
  const facultyRes = await makeRequest("POST", "/api/auth/login", {
    email: "faculty@sms.com",
    password: "faculty123",
  });
  assert.strictEqual(facultyRes.statusCode, 200, "Faculty login should return HTTP 200");
  assert.strictEqual(facultyRes.data.role, "faculty", "Faculty role should be 'faculty'");
  assert.ok(facultyRes.data.token, "Faculty login should return JWT token");
  console.log("✓ Valid Faculty Login Passed");

  // 3. Invalid Password
  const invalidPassRes = await makeRequest("POST", "/api/auth/login", {
    email: "admin@sms.com",
    password: "wrongpassword",
  });
  assert.strictEqual(invalidPassRes.statusCode, 401, "Invalid password should return HTTP 401");
  console.log("✓ Invalid Password Handling Passed");

  // 4. Invalid Email
  const invalidEmailRes = await makeRequest("POST", "/api/auth/login", {
    email: "nonexistent@sms.com",
    password: "admin123",
  });
  assert.strictEqual(invalidEmailRes.statusCode, 401, "Invalid email should return HTTP 401");
  console.log("✓ Invalid Email Handling Passed");

  // 5. Missing Credentials
  const missingRes = await makeRequest("POST", "/api/auth/login", { email: "" });
  assert.strictEqual(missingRes.statusCode, 400, "Missing credentials should return HTTP 400");
  console.log("✓ Missing Credentials Handling Passed");

  // 6. Protected Route Verification
  const meRes = await makeRequest("GET", "/api/auth/me", null, {
    authorization: `Bearer ${adminRes.data.token}`,
  });
  assert.strictEqual(meRes.statusCode, 200, "Protected route should return HTTP 200 with valid token");
  console.log("✓ Protected Route Access Passed");

  console.log("=== ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY ===");
}

runAuthTests().catch((err) => {
  console.error("❌ Authentication Test Failed:", err);
  process.exit(1);
});
