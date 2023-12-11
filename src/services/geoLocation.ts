import axios from 'axios'

export const getUserCountry = async (ip: string) => {
  try {
    const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOAPI}&ip=${ip}`)
    console.log(response.data)
    return response.data.country_name
  } catch (error) {
    return null
  }
}
