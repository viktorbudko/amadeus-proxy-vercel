import { amadeusFetch } from './_client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { origin, destination, date, departDate, adults = '1', currency = 'EUR' } = req.query;

  try {
    // 1. Запрос через SDK
    const response = await amadeusFetch('/v2/shopping/flight-offers', {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departDate || date,
      adults: adults,
      max: '10'
    });

    // 2. ВНИМАНИЕ: Для SDK мы НЕ пишем .json(), мы берем .data
    // Если бы мы использовали старый клиент, тут был бы .json(), но мы выбрали SDK.
    const rawData = response.data; 

    const results = (rawData || []).map(offer => ({
      id: offer.id,
      price: offer.price.total,
      currency: offer.price.currency,
      airline: offer.validatingAirlineCodes?.[0],
      itineraries: offer.itineraries
    }));

    res.status(200).json({ results });

  } catch (err) {
    const detail = err.response?.data?.errors?.[0]?.detail || err.message;
    res.status(500).json({ error: detail });
  }
}
