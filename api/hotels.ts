import { amadeusFetch } from './_client';

export default async function handler(req: any, res: any) {
  const { cityCode, checkIn, checkOut, adults = '2', currency = 'EUR' } = req.query;

  try {
    const r = await amadeusFetch('/v2/shopping/hotel-offers', {
      cityCode,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      currency,
    });

    const data = await r.json();

    const mapped = (data.data || []).map((h: any) => ({
      id: h.hotel.hotelId,
      name: h.hotel.name,
      address: h.hotel.address?.lines?.[0],
      rating: h.hotel.rating,
      price: h.offers?.[0]?.price?.total,
      currency: h.offers?.[0]?.price?.currency,
      thumbnail: h.hotel.media?.[0]?.uri,
    }));

    res.status(200).json({ results: mapped });
  } catch (err: any) {
    const message = err?.message ?? String(err);
    res.status(500).json({ error: message });
  }
}
