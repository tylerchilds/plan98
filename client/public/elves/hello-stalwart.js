
const key = plan98.env.PLAN98_EMAIL_PASSWORD
const username = plan98.env.PLAN98_EMAIL_USERNAME
const authUrl = plan98.env.PLAN98_EMAIL_URL;


fetch('http://localhost:8080/auth/device', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: 'testing'
  })
})
.then(r => r.json())
.then(data => {
  console.log(`Go to: ${data.verification_uri}`);
  console.log(`Code: ${data.user_code}`);
  
  // Poll for token
  const poll = setInterval(() => {
    const token = btoa('tychi:silly');
    fetch('http://localhost:8080/jmap/session', {
      headers: {
        'Authorization': `Basic ${token}`
      }
    })
    .then(r => r.json())
    .then(tokenData => {
        debugger
      if (tokenData.access_token) {
        debugger
        clearInterval(poll);
        console.log('Token:', tokenData.access_token);
      }
    });
  }, 5000);
});
