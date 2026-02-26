import Amadeus from 'amadeus';

export const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

export async function amadeusFetch(endpoint, params) {
  // SDK возвращает объект с полем .data
  return amadeus.client.get(endpoint, params);
}