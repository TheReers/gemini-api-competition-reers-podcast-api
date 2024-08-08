import { addSeconds, differenceInSeconds } from 'date-fns'

export const addSecondsToDate = (date: Date, seconds: number) => {
    return addSeconds(date, seconds)
}

export const differenceInSecondsBetweenDates = (date1: Date, date2?: Date) => {
    return differenceInSeconds(date1, date2 || new Date())
}
