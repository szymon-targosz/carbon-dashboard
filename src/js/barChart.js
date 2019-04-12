import * as d3 from 'd3';
import { getAllData, getType, getYearsRange } from '.';

export default class BarChart {
   constructor(parentElem) {
      this.parentElem = parentElem;
      this.margin = { left: 100, right: 30, top: 75, bottom: 50 }
      this.width = 800 - this.margin.left - this.margin.right;
      this.height = 350 - this.margin.bottom - this.margin.top;
      this.t = () => d3.transition().duration(1000).ease(d3.easeBounce);
      this.initVis();
   }

   initVis() {
      this.svg = d3.select(this.parentElem).append('svg')
         .attr('width', this.width + this.margin.left + this.margin.right)
         .attr('height', this.height + this.margin.bottom + this.margin.top);

      this.g = this.svg.append('g')
         .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      this.x = d3.scaleBand()
         .domain(getYearsRange())
         .range([0, this.width])
         .padding(.1);

      this.y = d3.scaleLinear()
         .range([this.height, 0]);

      this.xAxisCall = d3.axisBottom(this.x).ticks(10);
      this.yAxisCall = d3.axisLeft().tickFormat(d3.format('.2s'));

      this.xAxis = this.g.append('g')
         .attr('transform', `translate(0, ${this.height})`)
         .transition(this.t())
         .call(this.xAxisCall)
         .selectAll('text')
            .attr('transform', 'rotate(90)')
            .style('text-anchor', 'end')
            .attr('x', 35)
            .attr('font-size', '1.1rem')
            .attr('y', -5);

      this.yAxis = this.g.append('g');

      this.title = this.g.append('text')
         .attr('x', this.width / 2)
         .attr('y', -40)
         .attr('class', 'title');

      this.yLabel = this.g.append('text')
         .style('text-anchor', 'middle')
         .attr('x', -this.height / 2)
         .attr('y', -45)
         .attr('transform', 'rotate(-90)')
         .attr('font-size', '1.3rem')
         .attr('fill', '#f7f7f7');

      this.wrangleData();
   }

   wrangleData(countryCode = '') {
      this.type = getType();
      this.data = getAllData().filter(d => countryCode === d.countryCode).sort((a, b) => a.year - b.year);
      this.updateVis();
   }

   updateVis() {
      const max = d3.max(this.data, d => d[this.type]);
      this.y.domain([0, max === 0 ? 25 : max]);
      this.yAxisCall.scale(this.y);
      this.yAxis.transition(this.t()).call(this.yAxisCall);

      this.rects = this.g.selectAll('rect')
         .data(this.data, d => d.year);

      this.rects
         .exit()
         .transition(this.t())
         .attr('height', 0)
         .attr('y', this.height)
         .remove();

      this.rects
         .enter()
         .append('rect')
            .attr('height', 0)
            .attr('y', this.height)
         .merge(this.rects)
            .attr('width', this.x.bandwidth)
            .attr('x', d => this.x(d.year))
            .transition(this.t())
            .delay((d, i) => i * 75)
            .attr('y', d => this.y(d[this.type]))
            .attr('height', d => this.height - this.y(d[this.type]))
            
      this.yLabel.text(() => this.type === 'emissions' ? 'Emissions (thousand metric tons)' : 'Emissions per capita (metric tons)');

      this.title.text(this.data.length > 0 ? this.data[0].country : '');
   }

   highlightBars(year) {
      this.g.selectAll('rect')
            .attr("fill", d => d.year === year ? "#7246b3" : "#8357c5");
   }
}