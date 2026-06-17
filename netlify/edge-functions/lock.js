export default async (request, context) => {
  const url = new URL(request.url)
  const APP_KEY = Netlify.env.get('VITE_APP_KEY')
  if (!APP_KEY) return context.next()

  const submitKey = url.searchParams.get('key')
  if (submitKey) {
    if (submitKey === APP_KEY) {
      const response = new Response(null, { status: 302, headers: { Location: '/' } })
      response.headers.set(
        'Set-Cookie',
        `app_key=${APP_KEY}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
      )
      return response
    }
    return new Response(lockPage('Invalid key'), { status: 401, headers: { 'Content-Type': 'text/html' } })
  }

  const cookies = request.headers.get('cookie') || ''
  if (cookies.split(';').some((c) => c.trim() === `app_key=${APP_KEY}`)) {
    return context.next()
  }

  return new Response(lockPage(), { status: 401, headers: { 'Content-Type': 'text/html' } })
}

function lockPage(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Locked</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      background: #0a0015;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: monospace; color: white;
      gap: 16;
    }
    .lock { font-size: 48px; opacity: 0.2; }
    .msg { font-size: 14px; opacity: 0.5; }
    .error { font-size: 12px; color: #ff6b6b; display: ${error ? 'block' : 'none'}; }
    form { display: flex; gap: 8px; margin-top: 8px; }
    input {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px; padding: 8px 12px;
      color: white; font-size: 13px;
      font-family: monospace; outline: none; width: 200px;
    }
    button {
      background: #c084fc; border: none; border-radius: 6px;
      padding: 8px 16px; color: #0a0015; font-size: 13px;
      font-family: monospace; font-weight: bold; cursor: pointer;
    }
    button:hover { background: #a855f7; }
  </style>
</head>
<body>
  <div class="lock">&#x1f512;</div>
  <div class="msg">This application is locked.</div>
  <div class="error">${error || ''}</div>
  <form method="get" action="/">
    <input type="password" name="key" placeholder="Enter key" autofocus />
    <button type="submit">Unlock</button>
  </form>
</body>
</html>`
}
