import serviceWeather from "./utils/weatherServices.js";

//   :::::: Obtenemos la data de manera automática
serviceWeather.init().then(res => {
	console.log(res);
}).catch(err => {
	throw Error(`Ups ha ocurrido un error ${ err }`);
});

//   :::::: Obtenemos la data al usar el buscador
serviceWeather.getByCity();