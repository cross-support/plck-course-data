import {CompleteState, QuestionResultData, SuspendDataModel, SuspendDataState} from "./repository.type";
import {cloneDeep} from "lodash";

// すみません、このコードもproseeds.jsと同様原則そのまま処理を移植したものになっているのですか？
// 回答：こちらは、もともとの実装が特殊文字列を操作するような形式だったため、そのまま実装しようとすると処理内で文字列を作成したり、文字列の中を正規表現や文字列内検索を用いてチェックするという実装が必要だったため
// 特殊文字列をオブジェクト化して型付けしたり説明的に処理ができるようにしたヘルパー関数で今回新たに実装しました。
// これにより、各シーンで特殊文字操作に依存することなくLMSへのデータ登録処理を行えるようにしています。
// 例えば、バージョンを上げていく際に特殊文字列を使用せず別の方法を検討する場合であっても、このクラスの各メソッドや返すオブジェクト型は変えずに実装部分のみを変更できるようにしています。

/**
 * 講座の受講状況を表す特殊文字列を解釈し、JavaScriptで扱いやすくするためのヘルパークラス
 */
export class SuspendData {

    private suspendData: SuspendDataModel

    constructor(initSuspendDataStr: string) {
        this.suspendData = this.createSuspendDataFromString(initSuspendDataStr)
        // console.log(this.suspendData.states[3])
    }

    /**
     * 受講状況の特殊文字列からSuspendDataModalオブジェクトを作成する
     * @param suspendDataStr
     */
    private createSuspendDataFromString (suspendDataStr: string): SuspendDataModel {
        const arr = suspendDataStr.split('}')

        const result = {
            states: [],
            lastOpenPageIndex: null
        } as SuspendDataModel

        arr.forEach((str) => {
            const splitBracket = str.replace(/,?{?(.*)/, '$1')

            if (splitBracket.match(/^complete/)) {
                result.states.push(this.createCompleteSuspendState(splitBracket))
            }

            if (splitBracket.match(/^last_open_page/)) {
                const lastOpenPageArr = splitBracket.split(':')
                result.lastOpenPageIndex = parseInt(lastOpenPageArr[1])
            }

            if (splitBracket === '') {
                result.states.push({
                    complete: 'not-yet'
                })
            }
        })

        // console.log(result)
        return result
    }

    private createCompleteSuspendState(completeSuspendStr: string) {
        const arr = completeSuspendStr.split('/')
        const result = {} as SuspendDataState
        result.complete =  arr[0].match(/true/) ? 'completed' : 'not-completed';

        if (typeof arr[1] !== 'undefined') {
            const [ metaName, metaValue ] = arr[1].split(':')
            // console.log(metaName, metaValue)
            // メタ情報毎の処理を実行
            const metaValueResult = this.createMetaValue(metaName, metaValue)
            // メタ情報のラベルを取得
            result[metaName] = metaValueResult
        }

        return result
    }

    /**
     * suspendDataのcomplete以外のプロパティーの処理
     * 現状はqresultのみがある想定だが、今後増える可能性も考慮
     * @param metaName
     * @param metaValue
     */
    private createMetaValue(metaName, metaValue) {
        let result

        switch (metaName) {

            /**
             * qresultの文字列フォーマット
             * qresult: {result:boolean},{selectedAnswerIndex: string|number|any[]}|{result:boolean},{selectedAnswerIndex: number}...
             * result: 正解かどうか
             * selectedAnswerIndex: 選択した回答
             */
            case 'qresult': {
                result = []
                const qResultArr = metaValue.split('|')
                qResultArr.forEach((_result) => {
                    const resultSplit = _result.split(',')
                    result.push({
                        result: !!resultSplit[0].match(/true/),
                        selectedAnswer: (() => {
                            // console.log(resultSplit[1])
                            // 数字のみの場合
                            if (resultSplit[1].match(/^([0-9]*)$/)) {
                                return parseInt(resultSplit[1])
                            }
                            // +が含まれる場合: 複数の値があると判断
                            if (resultSplit[1].match(/\+/)) {
                                const multipleAnswer = resultSplit[1].split('+')
                                return multipleAnswer.map((answer) => {
                                    if (answer.match(/^[0-9]*$/)) {
                                        return parseInt(answer)
                                    } else {
                                        return answer
                                    }
                                })
                            }
                            // それ以外の場合: 文字列の場合
                            return resultSplit[1]
                        })()

                    } as QuestionResultData)
                })
                break;
            }

        }

        return result
    }

    /**
     * フレームのステートのクローン情報を渡す
     * クローン情報を渡すことで意図しない変更などを防ぐ
     */
    public getStates (): SuspendDataState[] {
        return cloneDeep(this.suspendData.states)
    }


    public getSuspendDataLength() {
        return this.suspendData.states.length
    }

    public updateSuspendData(stateIndex: number, state: SuspendDataState): void {
        this.suspendData.states[stateIndex] = state
    }

    public trimSuspendData(keepLength: number): void {
        const deleteLength = this.suspendData.states.length - keepLength
        if (deleteLength <= 0) return
        this.suspendData.states.splice(keepLength, deleteLength)
    }

    /**
     * シーンの完了状態を更新する
     * @param stateIndex
     * @param state
     */
    public changeSceneCompleteState (stateIndex: number, state: CompleteState): void {
        /**
         * 存在しない場合は初期値を追加する
         */
        const targetState = this.suspendData.states[stateIndex] || {
            complete: 'not-yet'
        }
        targetState.complete = state
        this.suspendData.states[stateIndex] = targetState
    }

    /**
     * クイズ形式のsuspendDataStateを更新する
     * @param stateIndex
     * @param questionIndex
     * @param selectedAnswer
     * @param result
     */
    public updateQuestionResult (
        stateIndex: number,
        questionIndex: number,
        selectedAnswer: number | string | any[],
        result: boolean): void
    {
        /**
         * 存在しない場合は初期データを追加する
         */
        const targetSuspendDataState = this.suspendData.states[stateIndex] || {
            complete: 'not-completed',
            qresult: []
        } as SuspendDataState

        if (!targetSuspendDataState.qresult) targetSuspendDataState.qresult = []
        targetSuspendDataState.qresult[questionIndex] = {
            selectedAnswer: selectedAnswer,
            result
        } as QuestionResultData

        this.suspendData.states[stateIndex] = targetSuspendDataState

    }

    /**
     * 回答結果をリセットする
     * @param stateIndex
     */
    public resetQuestionResult (stateIndex: number): void {
        if (this.suspendData.states[stateIndex].qresult) {
            this.suspendData.states[stateIndex].qresult = []
        }
    }

    /**
     * すべてのシーンが完了したかを返す
     */
    public isAllSceneCompleted() {
        let result = true
        for (let i = 0; i < this.suspendData.states.length; i++) {
            if (this.suspendData.states[i].complete !== 'completed') {
                result = false
                break
            }
        }
        return result
    }

    public updateLastOpenPage(lastOpenPageIndex: number): void {
        this.suspendData.lastOpenPageIndex = lastOpenPageIndex
    }

    public createSuspendDataString() {
        const strArr = []
        this.suspendData.states.forEach(state => {
            if (state.complete === 'not-yet') {
                strArr.push('{}')
            } else {
                const completeStrArr = []
                // 完了しているかどうかをパース
                completeStrArr.push(`complete:${state.complete === 'completed'}`)
                // メタ情報をパース
                const metaData = this.parseMetaToString(state)
                if (metaData) {
                    completeStrArr.push(this.parseMetaToString(state))
                }
                strArr.push(`{${completeStrArr.join('/')}}`)
            }
        })

        // 最後に,でjoinして返す
        return strArr.join(',')
    }

    private parseMetaToString(state): string {

        if (state.qresult !== undefined) {
            // qresultの文字列を作成
            const qresultStrArr = state.qresult.reduce((arr, data) => {
                arr.push(`${ data.result ? 'true' : 'false' },${Array.isArray(data.selectedAnswer) ? data.selectedAnswer.join('+') : data.selectedAnswer}`)
                return arr
            }, [])
            // qresultの文字列を|で連結して返す
            return `qresult:${qresultStrArr.join('|')}`
        }

    }

}