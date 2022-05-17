import { IGameData } from './Game';

function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}
// можно пролиноквать данные и потом не искать пару 
const generateRandomNumber = (from: number = 0, to: number = 23) => {
    let min = Math.ceil(from);
    let max = Math.floor(to);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const generateTimeCode = () => {
    let minutes: string | number = generateRandomNumber(0, 59);
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    return `${generateRandomNumber(0, 23)}:${minutes}`;
};
export const generateGameLevel = (amount: number): IGameData[] => {
    let arr = [];
    let savedNumber = generateTimeCode();

    let currIndex = 0;
    for (let i = 0; i < amount; i++) {
        if (Math.floor(i / 2) === currIndex) {
            arr.push({ id: i, text: savedNumber, selected: false, destroyed: false });
        }
        else {
            currIndex = Math.floor(i / 2);
            savedNumber = generateTimeCode();
            arr.push({ id: i, text: savedNumber, selected: false, destroyed: false });
        }
    }

    return shuffle(arr);
};
