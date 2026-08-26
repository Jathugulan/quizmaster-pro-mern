import assert from 'assert';
import app from '../src/app.js';
import http from 'http';

export const runApiTests = async () => {
  console.log('🧪 Running Express App & Comprehensive Route Integration Tests...');

  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test /api/health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200, 'Health check must return 200');
    assert.strictEqual(healthData.success, true, 'Health check must have success: true');
    assert.strictEqual(healthData.data.status, 'healthy', 'Health check must report healthy');

    // 2. Test /api/health/db
    const dbRes = await fetch(`${baseUrl}/api/health/db`);
    const dbData = await dbRes.json();
    assert.strictEqual(dbRes.status, 200, 'DB health endpoint must return 200');
    assert.strictEqual(dbData.success, true);
    assert.ok(typeof dbData.data.isConnected === 'boolean', 'isConnected must be boolean');

    // 3. Test 404 Route Handler
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route-xyz`);
    const notFoundData = await notFoundRes.json();
    assert.strictEqual(notFoundRes.status, 404, 'Non-existent route must return 404');
    assert.strictEqual(notFoundData.success, false);

    // 4. Test Public Registration Validation Rejection
    const invalidRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        username: 'ab', // too short (<3)
        email: 'invalid-email',
        password: '123', // too short (<6)
      }),
    });
    const invalidRegData = await invalidRegRes.json();
    assert.strictEqual(invalidRegRes.status, 422, 'Invalid registration input must return 422');
    assert.strictEqual(invalidRegData.success, false);
    assert.ok(Array.isArray(invalidRegData.errors) && invalidRegData.errors.length > 0);

    // 5. Test Protected Route without Token (Unauthorized 401)
    const unauthorizedRes = await fetch(`${baseUrl}/api/auth/me`);
    const unauthorizedData = await unauthorizedRes.json();
    assert.strictEqual(unauthorizedRes.status, 401, 'Protected route without token must return 401');
    assert.strictEqual(unauthorizedData.success, false);

    // 6. Test Admin Protected Route without Token (Unauthorized 401)
    const adminRes = await fetch(`${baseUrl}/api/admin/metrics`);
    const adminData = await adminRes.json();
    assert.strictEqual(adminRes.status, 401, 'Admin metrics without token must return 401');
    assert.strictEqual(adminData.success, false);

    // 7. Test AI Protected Route without Token (Unauthorized 401)
    const aiRes = await fetch(`${baseUrl}/api/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const aiData = await aiRes.json();
    assert.strictEqual(aiRes.status, 401, 'AI routes without token must return 401');
    assert.strictEqual(aiData.success, false);

    // 8. Test Public Certificate Verification route with non-existent cert
    const certRes = await fetch(`${baseUrl}/api/certificates/verify/NON-EXISTENT-CERT-12345`);
    const certData = await certRes.json();
    assert.strictEqual(certRes.status, 404, 'Invalid certificate number must return 404');
    assert.strictEqual(certData.success, false);

    console.log('✅ Express App & Route Integration Tests Passed Successfully.');
  } finally {
    server.close();
  }
};

if (process.argv[1].endsWith('api.test.js')) {
  runApiTests();
}
