import { amadeusFetch } from './_client';

export default async function handler(req: any, res: any) {
  const { origin, destination, departDate, returnDate, adults = '1', currency = 'EUR', max = '20' } = req.query;

  const q: Record<string, any> = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: departDate,
    adults,
    currencyCode: currency,
    max,
  };

  if (returnDate) q.returnDate = returnDate;

  try {
    const r = await amadeusFetch('/v2/shopping/flight-offers', q);
    const data = await r.json();

    const mapped = (data.data || []).map((offer: any) => ({
      id: offer.id,
      price: offer.price?.total,
      currency: offer.price?.currency,
      itineraries: offer.itineraries,
      validatingAirlineCodes: offer.validatingAirlineCodes,
    }));

    res.status(200).json({ results: mapped });
  } catch (err: any) {
    const message = err?.message ?? String(err);
    res.status(500).json({ error: message });
  }
}
