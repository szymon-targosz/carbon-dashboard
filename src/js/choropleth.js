import * as d3 from 'd3';
import { getYearData, getGeoData, getType, getMeshData, toggleBars } from './index';

export default class Choropleth {
   constructor(parentElem) {
      this.parentElem = parentElem;
      this.width = 850;
      this.height = 600;
      this.isMeshShown = false;

      this.initVis();
   }

   initVis() {
      this.svg = d3.select(this.parentElem).append('svg')
                     .attr('width', this.width)
                     .attr('height', this.height);

      this.g = this.svg.append('g')
            .attr('class', 'countries');

      this.projection = d3.geoMercator()
                           .scale(120)
                           .translate([this.width / 2, this.height / 1.5])

      this.path = d3.geoPath().projection(this.projection);

      this.domains = {
         emissions: [0, 2.5e5, 1e6, 5e6],
         emissionsPerCapita: [0, .5, 2, 10]
      };

      this.c = d3.scaleLinear().range(['#f1c40f', '#e67e22', '#e74c3c', '#c0392b']);

      this.title = this.g.append('text')
                        .attr('x', this.width / 2)
                        .attr('y', 20)
                        .attr('class', 'title');
                        
      this.tooltip = d3.select('.tooltip');

      this.wrangleData();
   }

   wrangleData() {
      this.type = getType();
      
      const countriesData = getYearData();
      this.year = countriesData.key;

      this.geoData = getGeoData();
      
      this.geoData.forEach(feature => {
         const country = countriesData.values.find(c => c.countryCode === feature.id);
         if (country) {
            feature.properties = {
               country: feature.properties.country,
               region: feature.properties.region,
               continent: country.continent,
               emissions: country.emissions,
               emissionsPerCapita: country.emissionsPerCapita,
               year: country.year
            }
         } else {
            feature.properties = {
               country: feature.properties.country,
               region: feature.properties.region
            }
         }
      });

      this.updateVis();
   }

   updateVis() {
      const vis = this;
      this.c.domain(this.domains[this.type]);

      this.paths = this.g.selectAll('path')
                        .data(this.geoData);

      this.paths
         .enter()
         .append('path')
            .attr('class', 'country-path')
            .attr('d', this.path)
            .on('mousemove touchstart', function(d) {
               d3.event.target.classList.add('active');
               vis.showTooltip(d.properties);
            })
            .on('mouseout touchend', (d) => {
               d3.event.target.classList.remove('active');
               vis.hideTooltip();
            })
            .on('click', function(d) {
               const country = d3.select(this);
               const isChosen = country.classed('chosen');
               d3.selectAll('.chosen').classed('chosen', false);
               if (isChosen) {
                  country.classed('chosen', false);
                  toggleBars();
               } else {
                  country.classed('chosen', true);
                  toggleBars(d.id);
               }
            })
         .merge(this.paths)
            .transition()
            .duration(500)
            .ease(d3.easeSinIn)
            .attr('fill', d => {
               const value = d.properties[this.type];
               return value ? this.c(value) : '#ccc';
            });

            
      if (!this.isMeshShown) {
         this.g.append('path')
            .datum(getMeshData())
            .attr('fill', 'none')
            .attr('stroke', '#333745')
            .attr('stroke-width', '.5px')
            .attr('class', 'boundary')
            .attr('d', this.path);
      
         this.isMeshShown = true;
      }

      this.title.text(() => {
         if (this.type === 'emissions') return `Carbon dioxide emissions - ${this.year}`;
         return `Carbon dioxide emissions per capita - ${this.year}`;
      });
   }

   showTooltip(d) {
      const units = this.type === 'emissions' ? 'thousand metric tons' : 'metric tons';
      const dataTypeText = this.type[0].toUpperCase() + this.type.slice(1).replace(/[A-Z]/g, l => ` ${l}`);
      const value = d[this.type] ? `${d[this.type].toLocaleString()} ${units}` : 'Data Not Available';
      this.tooltip
         .style('opacity', 1)
         .style('visibility', 'visible')
         .style('left', d3.event.pageX - (this.tooltip.node().offsetWidth / 2) + 'px')
         .style('top', d3.event.pageY - this.tooltip.node().offsetHeight - 10 + 'px')
         .html(`
            <p><span>Country:</span> ${d.country}</p>
            <p><span>Region:</span> ${d.region}</p>
            <p><span>${dataTypeText}:</span> ${value}</p>
            <p><span>Year:</span> ${this.year}</p>
         `);
   }

   hideTooltip() {
      this.tooltip
         .style('visibility', 'hidden')
         .style('opacity', 0);
   }
} 