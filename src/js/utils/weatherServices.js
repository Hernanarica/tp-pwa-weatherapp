import weather from "../weather.config.js";
import storage from "./storageServices.js";


const serviceWeather = {
	form: {
		formCity: document.querySelector('#form-city'),
		inputCity: document.querySelector('.city')
	},
	widget: {
		temperature: document.querySelector('.widget__temperature'),
		location: document.querySelector('.widget__info-location span'),
		date: null
	},
	country: {
		unit: null,
		latitude: null,
		longitude: null,
		maxTemperature: document.querySelector('.weather__info-max-temperature span'),
		minTemperature: document.querySelector('.weather__info-min-temperature span'),
		humidity: document.querySelector('.weather__info-humidity span'),
		thermalSensation: document.querySelector('.weather__info-thermal-sensation span'),
		pressureAtmospheric: document.querySelector('.weather__info-pressure-atmospheric span'),
		windSpeed: document.querySelector('.weather__info-wind-speed span')
	},
	getPosition: async function () {
		return await new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(pos => {
				this.country.latitude  = pos.coords.latitude;
				this.country.longitude = pos.coords.longitude;
				
				resolve();
			});
		});
	},
	init: async function () {
		if (storage.get('pais')) {
			const data   = JSON.parse(storage.get('pais'));
			const symbol = storage.get('symbol');
			
			this.renderInfo(data, symbol);
		} else {
			await this.getPosition();
			const res = await this.getUnit();
			this.getByCoords(res);
			return 'Todo ok';
		}
	},
	isFahrenheit: function (countryParam) {
		const countriesFahrenheit = [ 'United States of America', 'US', 'GB', 'MM', 'LR' ];
		
		return countriesFahrenheit.some(country => country === countryParam);
	},
	getUnit: function (firstSearch = true) {
		if (firstSearch) {
			return fetch(`${ weather.API }lat=${ this.country.latitude }&lon=${ this.country.longitude }&appid=${ weather.API_KEY }`).then(res => res.json()).then(data => {
				return data;
			});
		} else {
			return fetch(`${ weather.API }q=${ this.form.inputCity.value.trim() }&appid=${ weather.API_KEY }`).then(res => res.json()).then(data => {
				return data;
			});
		}
	},
	getByCoords: function (dataParam) {
		if (this.isFahrenheit(dataParam.sys.country)) {
			fetch(`${ weather.API }lat=${ this.country.latitude }&lon=${ this.country.longitude }&appid=${ weather.API_KEY }&units=imperial`).then(res => res.json()).then(data => {
				this.renderInfo(data, 'F');
			});
		} else {
			fetch(`${ weather.API }lat=${ this.country.latitude }&lon=${ this.country.longitude }&appid=${ weather.API_KEY }&units=metric`).then(res => res.json()).then(data => {
				this.renderInfo(data, 'C');
			});
		}
	},
	renderInfo: function (data, symbol) {
		if (this.ui.getHour() < 6 || this.ui.getHour() > 20) {
			this.ui.background.src = './src/assets/videos/night.mp4';
		} else {
			switch (data.weather[0]['main']) {
				case 'Clear':
					this.ui.background.src = './src/assets/videos/sun.mp4';
					this.ui.day.className  = 'icon__sun';
					break;
				case 'Clouds':
					this.ui.background.src = './src/assets/videos/clouds.mp4';
					this.ui.day.className  = 'icon__clouds';
					break;
				case 'Rain':
					this.ui.background.src = './src/assets/videos/rain.mp4';
					this.ui.day.className  = 'icon__rain';
					break;
				
				default:
					this.ui.background.src = './src/assets/videos/thunder.mp4';
					this.ui.day.className  = 'icon__thunder';
					break;
			}
		}
		// :::::: Widget
		this.widget.temperature.textContent          = `${ Math.round(data.main.temp) }°`;
		this.widget.location.textContent             = data.name;
		// //   :::::: Info
		this.country.thermalSensation.textContent    = `${ Math.round(data.main.temp) }`;
		this.country.maxTemperature.textContent      = `${ Math.round(data.main.temp_max) }°${ symbol }`;
		this.country.minTemperature.textContent      = `${ Math.round(data.main.temp_min) }°${ symbol }`;
		this.country.humidity.textContent            = `${ Math.round(data.main.humidity) }%`;
		this.country.pressureAtmospheric.textContent = `${ Math.round(data.main.pressure) } hPa`;
		this.country.windSpeed.textContent           = `${ Math.round(data.wind.speed) }m/s`;
		
	},
	getByCity: function () {
		this.form.formCity.addEventListener('submit', e => {
			e.preventDefault();
			
			this.getUnit(false).then(res => {
				if (this.isFahrenheit(res.sys.country)) {
					fetch(`${ weather.API }q=${ this.form.inputCity.value.trim() }&appid=${ weather.API_KEY }&units=imperial`).then(res => res.json()).then(data => {
						this.form.inputCity.value = '';
						this.renderInfo(data, 'F');
						
						storage.save('pais', JSON.stringify(data));
						storage.save('symbol', 'F');
					});
				} else {
					fetch(`${ weather.API }q=${ this.form.inputCity.value.trim() }&appid=${ weather.API_KEY }&units=metric`).then(res => res.json()).then(data => {
						this.form.inputCity.value = '';
						this.renderInfo(data, 'C');
						
						storage.save('pais', JSON.stringify(data));
						storage.save('symbol', 'C');
					});
				}
			});
		});
	},
	ui: {
		background: document.querySelector('.video-bg'),
		icon: {
			cloud: 'icon__clouds',
			rain: 'icon__rain',
			thunder: 'icon__thunder',
			sun: 'icon__sun',
			night: 'icon__night'
		},
		day: document.querySelector('.widget__info-location i'),
		getHour: function () {
			return new Date().getHours();
		}
	}
};

export default serviceWeather;