import { test, expect } from '@playwright/test';


const API_BASE_URL = 'https://demo.broadengage.com/api'; 
const VALID_EMAIL = 'shivam123jatav@gmail.com';
const VALID_PASSWORD = 'Shivam@123';

test.describe('Broad Engage - Login API Tests', () => {

    test('API_01 - Success Login with Valid Credentials', async ({ request }) => {
        const response = await request.post(`${API_BASE_URL}/login/`, {
            data: {
                email: VALID_EMAIL,
                password: VALID_PASSWORD
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

   
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        
    
        expect(responseBody).toHaveProperty('token'); 
       
        console.log('Login Successful, Token Received:', responseBody.token);
    });

    test('API_02 - Login Fail with Invalid Password', async ({ request }) => {
        const response = await request.post(`${API_BASE_URL}/login/`, {
            data: {
                email: VALID_EMAIL,
                password: 'WrongPassword123'
            }
        });

        expect(response.status()).toBe(401);
        
        const responseBody = await response.json();
  
        expect(responseBody.message).toContain('invalid' || 'failed');
    });

    test('API_03 - Validation Check for Empty Fields', async ({ request }) => {
        const response = await request.post(`${API_BASE_URL}/login/`, {
            data: {
                email: '',
                password: ''
            }
        });

      
        expect(response.status()).toBe(400);
    });

    test('API_04 - Invalid Email Format Validation', async ({ request }) => {
        const response = await request.post(`${API_BASE_URL}/login/`, {
            data: {
                email: 'invalid-email',
                password: VALID_PASSWORD
            }
        });

        expect(response.status()).toBe(400);
    });
});