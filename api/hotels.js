import { amadeusFetch } from './_client.js'; // Обязательно .js

export default async function handler(req, res) {
  // 1. Добавляем CORS (чтобы Lovable видел отели)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. Получаем параметры
  const { cityCode, checkIn, checkOut, adults = '1', currency = 'EUR' } = req.query;

  try {
    // 3. Запрос через SDK
    const response = await amadeusFetch('/v2/shopping/hotel-offers', {
      cityCode,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      currency,
      roomQuantity: '1'
    });

    // 4. В SDK данные уже лежат в .data. НЕ вызываем .json()
    const rawData = response.data || [];

    // 5. Маппинг данных (упрощаем для Lovable)
    const mapped = rawData.map(h => ({
      id: h.hotel.hotelId,
      name: h.hotel.name,
      address: h.hotel.address?.lines?.[0], // Берем первую строку адреса
      rating: h.hotel.rating,
      price: h.offers?.[0]?.price?.total,
      currency: h.offers?.[0]?.price?.currency,
      // Фотографии отелей в тестовом API часто отсутствуют, но оставим на всякий случай
      thumbnail: h.hotel.media?.[0]?.uri, 
      latitude: h.hotel.latitude,
      longitude: h.hotel.longitude
    }));

    res.status(200).json({ results: mapped });

  } catch (err) {
    // Красивая обработка ошибок
    const detail = err.response?.data?.errors?.[0]?.detail || err.message || 'Unknown error';
    console.error('Hotels Error:', detail);
    res.status(500).json({ error: detail });
  }
}
