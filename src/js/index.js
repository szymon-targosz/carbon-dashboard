import * as d3 from 'd3';
import { feature, mesh } from 'topojson';
import Choropleth from './choropleth';
import BarChart from './barChart';
import '../styles/index.css';

let geoData, dataByYear, allData, meshData, yearsRange, choropleth, barChart, activeCountry, count = 0;
const slider = document.getElementById('year');
const yearSpan = document.getElementById('year-span');

const promises = [
   d3.csv('../data/all.csv', (row) => ({
      continent: row.Continent,
      country: row.Country,
      countryCode: row["Country Code"],
      emissions: +row["Emissions"],
      emissionsPerCapita: +row["Emissions Per Capita"],
      region: row.Region,
      year: +row.Year
   })),
   d3.json('//unpkg.com/world-atlas@1.1.4/world/50m.json')
];

Promise.all(promises)
   .then(([data, mapData]) => {
      yearsRange = d3.extent(data, d => d.year)
      dataByYear = d3.nest().key(d => d.year).entries(data).reverse();
      allData = data;
      meshData = mesh(mapData, mapData.objects.countries, (a, b) => a !== b);

      geoData = feature(mapData, mapData.objects.countries).features;

      geoData.forEach(feature => {
         const c = data.find(d => d.countryCode === feature.id);
         let country = '', region = '';
         if (c) {
            country = c.country
            region = c.region
         };
         feature.properties = { country, region };
      })

      yearSpan.textContent = yearsRange[0];
      slider.setAttribute('min', yearsRange[0]);
      slider.setAttribute('max', yearsRange[1]);
      slider.setAttribute('value', yearsRange[0]);

      choropleth = new Choropleth('#map');
      barChart = new BarChart('#bar-chart');
   })
   .catch(e => console.warn(e));


document.querySelectorAll('input[name="type"]').forEach(input => {
   input.addEventListener('change', () => {
      choropleth.wrangleData();
      toggleBars(activeCountry);
   });
});

slider.addEventListener('input', function (e) {
   count = this.value - yearsRange[0];
   yearSpan.textContent = this.value;
   choropleth.wrangleData();
   barChart.highlightBars(+this.value);
});

function toggleBars(countryCode) {
   activeCountry = countryCode;
   const year = +slider.value;
   barChart.wrangleData(activeCountry);
   barChart.highlightBars(year);
};

const getGeoData = () => geoData;
const getMeshData = () => meshData;
const getYearData = () => dataByYear[count];
const getAllData = () => allData;
const getType = () => document.querySelector('input[name="type"]:checked').value;
const getYearsRange = () => {
   const arr = [];
   let year = yearsRange[0]
   while (year <= yearsRange[1]) {
      arr.push(year);
      year++;
   }
   return arr;
};

export { getGeoData, getYearData, getAllData, getMeshData, getType, toggleBars, getYearsRange };