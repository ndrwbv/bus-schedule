import { DirectionsNew, IOption, IStops, StopKeys } from '../Stops'

export const STOPS_IN: IStops<DirectionsNew.inLB>[] = [
    {
        id: `15`,
        label: `Интернационалистов`,
        direction: DirectionsNew.inLB,
        latLon: [56.513582, 84.989332],
    },
    {
        id: `16`,
        label: `пл. Ленина`,
        direction: DirectionsNew.inLB,
        latLon: [56.487565, 84.948113],
    },
    {
        id: `17`,
        label: `ТЮЗ`,
        direction: DirectionsNew.inLB,
        latLon: [56.483271, 84.948648],
    },
    {
        id: `18`,
        label: `Главпочтамт`,
        direction: DirectionsNew.inLB,
        latLon: [56.47866, 84.949825],
    },
    {
        id: `19`,
        label: `Новособорная`,
        direction: DirectionsNew.inLB,
        latLon: [56.475608, 84.949855],
    },
    {
        id: `20`,
        label: `ТГУ`,
        direction: DirectionsNew.inLB,
        latLon: [56.471262, 84.950286],
    },
    {
        id: `21`,
        label: `Библиотека ТГУ`,
        direction: DirectionsNew.inLB,
        latLon: [56.468215, 84.950393],
    },
    {
        id: `22`,
        label: `ТЭМЗ`,
        direction: DirectionsNew.inLB,
        latLon: [56.463891, 84.950634],
    },
    {
        id: `23`,
        label: `Учебная`,
        direction: DirectionsNew.inLB,
        latLon: [56.460093, 84.950776],
    },
    {
        id: `24`,
        label: `Лагерный Сад`,
        direction: DirectionsNew.inLB,
        latLon: [56.45532, 84.950723],
    },
    {
        id: `25`,
        label: `Левитана`,
        direction: DirectionsNew.inLB,
        latLon: [56.446951, 84.921565],
    },
    {
        id: `26`,
        label: `Синее небо`,
        direction: DirectionsNew.inLB,
        latLon: [56.445827, 84.917034],
    },
    {
        id: `27`,
        label: `Этюд`,
        direction: DirectionsNew.inLB,
        latLon: [56.441423, 84.916935],
    },
    {
        id: `28`,
        label: `Гармония`,
        direction: DirectionsNew.inLB,
        latLon: [56.441418, 84.919334],
    },
    {
        id: `29`,
        label: `Три элемента`,
        direction: DirectionsNew.inLB,
        latLon: [56.444195, 84.919244],
    },
    {
        id: `30`,
        label: `Cеребряный бор`,
        direction: DirectionsNew.inLB,
        latLon: [56.459504, 84.906008],
    },
]

export const StopsInOptions: IOption<StopKeys | null>[] = [
    {
        label: `Не выбрано`,
        value: null,
    },
    ...STOPS_IN.map(stop => ({
        label: stop.label,
        value: stop.label,
    })),
]