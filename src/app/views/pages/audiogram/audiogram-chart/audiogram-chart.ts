import {
  Component,
  computed,
  input
} from '@angular/core';

import { CommonModule } from '@angular/common';


// =====================================================
// MERGED AUDIOGRAM MODEL
// =====================================================


type Ear = 'left' | 'right';


type Conduction = 'AC' | 'BC';



interface AudiogramReading {

  ear: Ear;

  conduction: Conduction;

  frequency: number;

  dB: number | null;

  masked: boolean;

  noResponse: boolean;

  rowKey: string;

}



const FREQUENCIES = [

  250,

  500,

  1000,

  2000,

  4000,

  8000

] as const;



const BOTTOM_LABELS = [

  {
    frequency: 750,
    label: '750'
  },

  {
    frequency: 1500,
    label: '1.5K'
  },

  {
    frequency: 3000,
    label: '3K'
  },

  {
    frequency: 6000,
    label: '6K'
  }

];



const DB_VALUES = [

  0,

  10,

  20,

  30,

  40,

  50,

  60,

  70,

  80,

  90,

  100,

  110,

  120,

  130

];



const EAR_COLOR = {


  left: '#0070C0',


  right: '#FF0000'


} as const;





type SymbolType =

  | 'circle'

  | 'cross'

  | 'triangle'

  | 'square'

  | 'lt'

  | 'gt'

  | 'bracket-left'

  | 'bracket-right';





interface PlotPoint {


  x: number;


  y: number;


  color: string;


  ear: Ear;


  symbol: SymbolType;


  masked: boolean;


  noResponse: boolean;


  conduction: Conduction;


  frequency: number;


  dB: number;


}



interface ConnectionLine {


  color: string;


  dashed: boolean;


  rowKey: string;


  points: string;


}





@Component({

  selector: 'app-audiogram-chart',

  standalone: true,

  imports: [

    CommonModule

  ],

  templateUrl: './audiogram-chart.html',

  styleUrls: ['./audiogram-chart.scss']

})


export class AudiogramChartComponent {


  readings = input.required<AudiogramReading[]>();


  readonly frequencies = FREQUENCIES;


  readonly dbValues = DB_VALUES;


  readonly bottomLabels = BOTTOM_LABELS;


  readonly EAR_COLOR = EAR_COLOR;



  // =====================================================
  // DIMENSIONS
  // =====================================================


  readonly chartWidth = 760;


  readonly chartHeight = 820;


  readonly leftPadding = 55;


  readonly rightPadding = 30;


  readonly topPadding = 55;


  readonly bottomPadding = 85;



  readonly graphWidth =

    this.chartWidth -

    this.leftPadding -

    this.rightPadding;



  readonly graphHeight =

    this.chartHeight -

    this.topPadding -

    this.bottomPadding;





  readonly gridFrequencies = [

    250,

    500,

    750,

    1000,

    1500,

    2000,

    3000,

    4000,

    6000,

    8000

  ];




  private readonly GRID_MAP = new Map<number, number>([

    [250, 0],

    [500, 1],

    [750, 2],

    [1000, 3],

    [1500, 4],

    [2000, 5],

    [3000, 6],

    [4000, 7],

    [6000, 8],

    [8000, 9]

  ]);





  // =====================================================
  // X POSITION
  // =====================================================


  xForFrequency(

    frequency: number

  ): number {


    const column =

      this.GRID_MAP.get(frequency);



    if (column === undefined) {

      return this.leftPadding;

    }



    const step =

      this.graphWidth / 10;



    return (

      this.leftPadding +

      (column + 0.5) * step

    );


  }





  // =====================================================
  // Y POSITION
  // =====================================================


  yForDb(
    value: number
  ): number {

    // Never allow chart values outside 0–130 dB
    const safeValue = Math.max(
      0,
      Math.min(130, value)
    );

    return (
      this.topPadding +
      (
        safeValue / 130
      ) *
      this.graphHeight
    );

  }

  // =====================================================
  // SYMBOL SELECTION
  // =====================================================


  private symbolFor(

    reading: AudiogramReading

  ): SymbolType {



    if (reading.conduction === 'AC') {


      if (reading.ear === 'right') {


        return reading.masked

          ? 'triangle'

          : 'circle';


      }



      return reading.masked

        ? 'square'

        : 'cross';


    }



    // BC


    if (reading.ear === 'right') {


      return reading.masked

        ? 'bracket-left'

        : 'lt';


    }



    return reading.masked

      ? 'bracket-right'

      : 'gt';


  }





  // =====================================================
  // POINTS
  // =====================================================


  points = computed<PlotPoint[]>(() => {


    return this.readings()

      .filter(

        reading =>

          reading.dB !== null

      )

      .map(reading => ({


        x:

          this.xForFrequency(

            reading.frequency

          ),



        y:

          this.yForDb(

            reading.dB as number

          ),



        color:

          EAR_COLOR[reading.ear],



        ear:

          reading.ear,



        symbol:

          this.symbolFor(

            reading

          ),



        masked:

          reading.masked,



        noResponse:

          reading.noResponse,



        conduction:

          reading.conduction,



        frequency:

          reading.frequency,



        dB:

          reading.dB as number



      }));


  });





  // =====================================================
  // AIR CONDUCTION LINES
  // =====================================================


  airLines = computed<ConnectionLine[]>(() => {


    const lines: ConnectionLine[] = [];




    const rows = [


      'ac',


      'ac_mask',


      'ac_without_mask'


    ];




    (['left', 'right'] as Ear[])

      .forEach(ear => {



        rows.forEach(row => {



          const points = this.readings()

            .filter(reading =>


              reading.ear === ear &&


              reading.rowKey === row &&


              reading.dB !== null


            )

            .sort(

              (a, b) =>

                a.frequency -

                b.frequency

            );




          if (points.length < 2) {

            return;

          }




          lines.push({


            color:

              row === 'ac_without_mask'

                ? '#444'

                : EAR_COLOR[ear],



            dashed: false,



            rowKey: row,



            points:

              points

                .map(point =>


                  `${this.xForFrequency(

                    point.frequency

                  )

                  },${this.yForDb(

                    point.dB!

                  )

                  }`

                )

                .join(' ')



          });



        });



      });




    return lines;


  });





  // =====================================================
  // BONE CONDUCTION LINES
  // =====================================================


  boneLines = computed<ConnectionLine[]>(() => {


    const lines: ConnectionLine[] = [];




    const rows = [

      'bc',

      'bc_mask'

    ];





    (['left', 'right'] as Ear[])

      .forEach(ear => {



        rows.forEach(row => {



          const points = this.readings()

            .filter(reading =>



              reading.ear === ear &&



              reading.rowKey === row &&



              reading.dB !== null



            )

            .sort(

              (a, b) =>

                a.frequency -

                b.frequency

            );




          if (points.length < 2) {

            return;

          }





          lines.push({



            color:

              EAR_COLOR[ear],




            dashed: true,




            rowKey: row,




            points:

              points

                .map(point =>


                  `${this.xForFrequency(

                    point.frequency

                  )

                  },${this.yForDb(

                    point.dB!

                  )

                  }`

                )

                .join(' ')



          });




        });



      });




    return lines;


  });



}