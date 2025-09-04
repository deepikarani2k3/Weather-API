const apiKey = "7260a2b34c8ade2fb13cbe6f06b7818b";
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const forecastDiv = document.getElementById("forecast");
const errorDiv = document.getElementById("error");
const recentCitiesDiv = document.getElementById("recentCities");
const cityDropdown = document.getElementById("cityDropdown");
const unitToggle = document.getElementById("unitToggle");
const suggestionsBox = document.getElementById("suggestions");

let isCelsius = true;
let currentTempC = null;
let forecastData = []; 