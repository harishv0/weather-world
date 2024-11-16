import axios from 'axios'
import { apiKey } from '../index'
import { method } from 'lodash';

const fetchEndPoints = (params) => `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityname}&days=${params.days}&aqi=no&alerts=no`;
const fetchbyCityName = (params) => `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityname}`;

const apiCall = async(endpoints) => {
    const options = {
        method : 'GET',
        URL : endpoints
    }
    try {
        const response = await axios.request(options);
        return response.data
    } catch (error) {
        console.log("Error");
        return null; 
        
    }
}

export const fetchWeatherForecast = async(params) => {
    return apiCall(await axios.get(fetchEndPoints(params)));
}

export const fetchWeatherLocation = async(params) => {
    return await axios.get(fetchbyCityName(params)).data;
}