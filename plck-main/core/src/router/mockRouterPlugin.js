/**
 * モック実行の際に、
 */
export default (app, to, from, next) => {
    const {
        UnitId,
        UserLearningLessonId,
    } = to.query

    console.log({ to, from, next })
    if (!UnitId && !UserLearningLessonId) {
        // location.href = 'http://localhost:8000/?UnitId=1&UserLeaningLessonId=1&lectureSortNo=1&Root='
        next('/?UnitId=1&UserLearningLessonId=1&LecturePathSortNo=1&Root=')
    } else {
        next()
    }
}