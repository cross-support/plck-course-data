

export type ControllerLessonInfo = {
    state: '0' | '1' | '2'
    url: string
}

export type ControllerData = {
    errcode: string
    nextlesson: ControllerLessonInfo
    prevlesson: ControllerLessonInfo
    nextpage: ControllerLessonInfo
    prevpage: ControllerLessonInfo
    result: 'success' | string
}

export type QuestionResultData = {
    /**
     * 選択した回答の番号
     * indexとしているが、番号のスタートは1番からスタート
     * 選択した回答の種類
     * 選択式: number
     * 複数選択式: number[]
     * 文字列回答: string
     * 複数文字列回答: any[] ・・・場合によっては数値が入る可能性があり、 [ 1, '文字列' ]のような回答が含まれる可能性があるため、 any[] とする
     * 上記踏まえ、型指定としては、 number | string | any[] とする
     */
    selectedAnswer: number | string | any[],
    // any型を用意しているのはどういう目的からでしょうか？
    // 回答: コメント追記いたしました。
    /**
     * 正解かどうか
     */
    result: boolean
}

export type CompleteState = 'completed' | 'not-completed' | 'not-yet'

export type SuspendDataState = {
    complete: CompleteState
    qresult?: QuestionResultData[]
}

export type SuspendDataModel = {
    states: SuspendDataState[],
    lastOpenPageIndex: number,
}