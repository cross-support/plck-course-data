/**
 * inspired from https://masanyon.com/javascript-array-list-grouping-separator/
 * @param list
 * @param perNum
 */
export default (list: any[], perNum: number = 6): any[] => {
    const len = list.length
    let currentNum = 0
    const separateList = []
    let tmpList = []

    list.forEach((item, index) => {
        currentNum = index +1
        tmpList.push(item)
        if (currentNum % perNum === 0) {
            separateList.push(tmpList)
            tmpList = []
        }
        if (len === currentNum) {
            if (!tmpList.length) return
            else separateList.push(tmpList)
        }
    })

    return separateList
}