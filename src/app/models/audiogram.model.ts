export type Ear = 'left' | 'right';

export type Conduction = 'AC' | 'BC';

export interface AudiogramReading {
  ear: Ear;
  conduction: Conduction;

  /** 250,500,1000,2000,4000,8000 */
  frequency: number;

  /** value in dB */
  dB: number | null;

  /** AC MASKING / BC MASKING */
  masked: boolean;

  /** No Response */
  noResponse: boolean;

  /** Internal row key */
  rowKey: string;
}

export const FREQUENCIES = [
  250,
  500,
  1000,
  2000,
  4000,
  8000
] as const;

export const FREQUENCY_LABELS: Record<number, string> = {
  250: "250Hz",
  500: "500Hz",
  1000: "1KHz",
  2000: "2KHz",
  4000: "4KHz",
  8000: "8KHz"
};

export const BOTTOM_LABELS = [
  { frequency: 750, label: '750' },
  { frequency: 1500, label: '1.5K' },
  { frequency: 3000, label: '3K' },
  { frequency: 6000, label: '6K' }
];

export const DB_VALUES = [
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

export const EAR_COLOR = {

  left: '#0070C0',

  right: '#FF0000'

} as const;

export interface RowType {

  key: string;

  label: string;

  conduction: Conduction;

  masked: boolean;

  noResponse: boolean;

}

export const ROW_TYPES: RowType[] = [

  {
    key: 'ac',
    label: 'AC',
    conduction: 'AC',
    masked: false,
    noResponse: false
  },

  {
    key: 'bc',
    label: 'BC',
    conduction: 'BC',
    masked: false,
    noResponse: false
  },

  {
    key: 'ac_mask',
    label: 'AC MASKING',
    conduction: 'AC',
    masked: true,
    noResponse: false
  },

  {
    key: 'bc_mask',
    label: 'BC MASKING',
    conduction: 'BC',
    masked: true,
    noResponse: false
  },

  {
    key: 'ac_nr',
    label: 'AC (N.R.)',
    conduction: 'AC',
    masked: false,
    noResponse: true
  },

  {
    key: 'bc_nr',
    label: 'BC (N.R.)',
    conduction: 'BC',
    masked: false,
    noResponse: true
  },

  {
    key: 'ac_mask_nr',
    label: 'AC MASKING (N.R.)',
    conduction: 'AC',
    masked: true,
    noResponse: true
  },

  {
    key: 'bc_mask_nr',
    label: 'BC MASKING (N.R.)',
    conduction: 'BC',
    masked: true,
    noResponse: true
  },

  {
    key: 'ac_without_mask',
    label: 'AC WITHOUT MASKING',
    conduction: 'AC',
    masked: false,
    noResponse: false
  }

];

export const PTA_ROW_KEYS = [

  'ac',
  'ac_mask',
  'ac_nr',
  'ac_mask_nr'

];

export function createEmptyReadings(): AudiogramReading[] {

  const list: AudiogramReading[] = [];

  const ears: Ear[] = ['left', 'right'];

  ears.forEach(ear => {

    ROW_TYPES.forEach(row => {

      FREQUENCIES.forEach(freq => {

        list.push({

          ear,

          frequency: freq,

          conduction: row.conduction,

          masked: row.masked,

          noResponse: row.noResponse,

          rowKey: row.key,

          dB: null

        });

      });

    });

  });

  return list;

}