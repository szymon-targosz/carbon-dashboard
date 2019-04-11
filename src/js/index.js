import * as d3 from 'd3';
import { feature, mesh } from 'topojson';
import Choropleth from './choropleth';
import '../styles/index.css';

let geoData, countriesData, meshData, yearsRange, choropleth, count = 0;
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
      countriesData = d3.nest().key(d => d.year).entries(data).reverse();
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
   })
   .catch(e => console.warn(e));


document.querySelectorAll('input[name="type"]').forEach(input => {
   input.addEventListener('change', update);
});

slider.addEventListener('input', function(e) {
   count = this.value - yearsRange[0];
   yearSpan.textContent = this.value;
   update();
});



function update() {
   choropleth.wrangleData();
}

const getGeoData = () => geoData;
const getMeshData = () => meshData;
const getCountriesData = () => countriesData[count];
const getType = () => document.querySelector('input[name="type"]:checked').value;

export { getGeoData, getCountriesData, getMeshData, getType };