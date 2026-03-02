const { test, expect } = require('@playwright/test');

test('Broad Engage Login API Test', async ({ request }) => {
  const response = await request.post('https://demo.broadengage.com/', {
    data: {
      username: 'your_username',
      password: 'your_password'
    }
  });

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  console.log(responseBody);
  expect(responseBody).toHaveProperty('token');
});