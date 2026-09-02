const fs = require('fs');
const path = require('path');

async function testUpload() {
  const token = await login();
  console.log('Got token');
  
  const FormData = require('form-data');
  const form = new FormData();
  form.append('resume', fs.createReadStream(path.join(__dirname, 'valid_resume.pdf')));
  
  const fetch = (await import('node-fetch')).default;
  try {
      const res = await fetch('http://127.0.0.1:5000/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });
      
      const text = await res.text();
      console.log(res.status, text);
    } catch (err) {
      console.error(err);
    }
  }
  
  async function login() {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
  });
  const data = await res.json();
  return data.token;
}

testUpload();
