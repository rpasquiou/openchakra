// @ts-nocheck
import React from 'react';
import {
  Chart as ChartJS,
  ChartType,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Scatter, Radar } from 'react-chartjs-2';
import { Box } from '@chakra-ui/react';
import { TypedChartComponent } from 'react-chartjs-2/dist/types';
import moment from 'moment'
import lodash from 'lodash'
import 'moment/locale/fr'
moment.locale('fr')

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  );


const OwnChart = (
  {
    isEditable = false, // read-only or writable
    name,
    value,
    attribute,
    id,
    chartType = 'line',
    ...props
  }
    : {
      isEditable: boolean
      name: string
      value:{date:any, [key:string]: number, x:string, y:string}[]
      attribute: string
      id: string,
      chartType: ChartType,
      datasets: any,
    }) => {

      // TEST if font
      const isFontFamily = props.hasOwnProperty('fontFamily')
      const font = isFontFamily ? props.fontFamily?.base : 'inherit'
      const isFontSize = props.hasOwnProperty('fontSize')
      const fontSize = isFontSize ? (parseInt(props.fontSize?.base, 10) || 12 ) : 14

      let options = {
        scales: {
          r: {
            grid: {
              color: '#FFFFFF' // Color of the grid lines (spider web)
            },
            angleLines: {
              color: '#FFFFFF' // Color of the lines that radiate from the center (spokes)
            },
            pointLabels: {
              color: '#FFFFFF',  // Color of the labels around the radar chart
            },
            // ticks: {
            //   display: false // Hides the labels in the middel (numbers)
            // }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            title: {
              color: 'rgb(FF,FF,FF)',
            },
            position: 'bottom' as const,
            labels: {
              usePointStyle: true,
              font: {
                family: isFontFamily ? font : 'inherit',
                size: isFontSize ? fontSize : 12,
              }
            }
          },
          title: {
          display: true,
          // text: 'Titre du graphe', // Chart Title
          },
        },
      };

      const typesOfCharts = {
        'line': Line,
        'bar': Bar,
        'radar': Radar,
      }
      // @ts-ignore
      const RetainedChart = typesOfCharts[chartType]

      let data

      if (chartType == 'radar') {

        const orderValues =  (labels, values) => {
          return labels.map(l => values.find(v => v.label==l)?.y)
        }

        data = {
          labels: value?.labels,
          datasets: (value?.series || []).map((s, idx) => ({
            label: s.name,
            data: orderValues(value?.labels, s.values),
            fill: true,
            backgroundColor: s.color,
            borderColor: s.color,
            pointBackgroundColor: s.color,
            pointBorderColor: s.color,
            pointHoverBackgroundColor: s.color,
            pointHoverBorderColor: s.color,
          }))
        }

        //Change color of boxes around axis numbers
        options.scales.r.ticks = {
          color: 'white',
          backdropColor: 'black'
        }

      } else {

        const dateSeries=value?.some(v => !!v.date)
        const labels = value?.map(v => dateSeries ? moment(v.date).format('L') : v.x)

        const datasets=lodash.range(5).map(index => {
          const attribute=props[`series_${index}_attribute`]
          const series_data=value?.map(v => v.x ? ({x: v.x, y:v.y}) : ({x:moment(v.date).format('L'), y:v[attribute]}))
          const label=props[`series_${index}_label`]
          const color=props[`series_${index}_color`]
          if ((!dateSeries || attribute) && label) {
            return ({
              label,
              data: series_data,
              spanGaps: true,
              backgroundColor: color,
              borderColor: color,
              spanGaps: true,
            })
          }
          else {return null}
        })
        .filter(v => !!v)

        data = {
          labels,
          datasets
        };
      }

      const FinalChart:TypedChartComponent<ChartType> = () => React.createElement(RetainedChart, {data, options})

  return (
    <Box id={id} {...props}>
      <FinalChart />
    </Box>
  )

}

export default OwnChart
