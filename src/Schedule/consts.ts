export const MAIN_GREY = "#F4F4F4";

export type DayKeys =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const Stops = [
  {
    label: "В. Маяковского",
    value: "В. Маяковского",
  },
  {
    label: "сосновый бор",
    value: "сосновый бор",
  },
];

export type StopKeys = "В. Маяковского" | "сосновый бор";

export const SCHEDULE: Record<number, Record<StopKeys, string[]>> = {
  1: {
    "В. Маяковского": [
      "6:37",
      "07:07",
      "07:22",
      "07:42",
      "08:17",
      "09:12",
      "09:42",
      "10:12",
      "10:42",
      "11:22",
      "12:07",
      "12:57",
      "13:32",
      "14:42",
      "15:52",
      "16:52",
      "17:22",
      "17:52",
      "18:22",
      "18:52",
      "19:42",
      "20:22",
      "21:01",
    ],
    "сосновый бор": [],
  },
  2: {
    "В. Маяковского": [
      "6:37",
      "07:07",
      "07:22",
      "07:42",
      "08:17",
      "09:12",
      "09:42",
      "10:12",
      "10:42",
      "11:22",
      "12:07",
      "12:57",
      "13:32",
      "14:42",
      "15:52",
      "16:52",
      "17:22",
      "17:52",
      "18:22",
      "18:52",
      "19:42",
      "20:22",
      "21:01",
    ],
    "сосновый бор": [],
  },
  3: {
    "В. Маяковского": [
      "6:37",
      "07:07",
      "07:22",
      "07:42",
      "08:17",
      "09:12",
      "09:42",
      "10:12",
      "10:42",
      "11:22",
      "12:07",
      "12:57",
      "13:32",
      "14:42",
      "15:52",
      "16:52",
      "17:22",
      "17:52",
      "18:22",
      "18:52",
      "19:42",
      "20:22",
      "21:01",
    ],
    "сосновый бор": [],
  },
  4: {
    "В. Маяковского": [
      "6:37",
      "07:07",
      "07:22",
      "07:42",
      "08:17",
      "09:12",
      "09:42",
      "10:12",
      "10:42",
      "11:22",
      "12:07",
      "12:57",
      "13:32",
      "14:42",
      "15:52",
      "16:52",
      "17:22",
      "17:52",
      "18:22",
      "18:52",
      "19:42",
      "20:22",
      "21:01",
    ],
    "сосновый бор": [],
  },
  5: {
    "В. Маяковского": [
      "6:37",
      "07:07",
      "07:22",
      "07:42",
      "08:17",
      "09:12",
      "09:42",
      "10:12",
      "10:42",
      "11:22",
      "12:07",
      "12:57",
      "13:32",
      "14:42",
      "15:52",
      "16:52",
      "17:22",
      "17:52",
      "18:22",
      "18:52",
      "19:42",
      "20:22",
      "21:01",
    ],
    "сосновый бор": [],
  },
  6: {
    "В. Маяковского": [
      "07:07",
      "08:17",
      "09:12",
      "10:12",
      "11:22",
      "12:07",
      "12:57",
      "13:32",
      "14:42",
      "15:52",
      "16:52",
      "17:52",
      "18:52",
      "19:42",
    ],
    "сосновый бор": [],
  },
  0: {
    "В. Маяковского": [
      "08:17",
      "09:12",
      "10:12",
      "11:22",
      "12:07",
      "12:57",
      "14:42",
      "15:52",
      "16:52",
      "17:52",
      "18:52",
      "19:42",
    ],
    "сосновый бор": [],
  },
};
