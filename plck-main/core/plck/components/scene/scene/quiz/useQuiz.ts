import {computed, reactive, ref, watch} from "vue";
import {QuizConfig, QuizQuestion, QuizState} from "./quiz.type.ts";
import {usePlckStore} from "@/store/plck.ts";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {CompleteState, QuestionResultData} from "@corePlck/repository/repository.type.ts";
import useSpecificButton from "@/components/plck/base/useSpecificButton.ts";


export const useQuiz = (
    sceneName: string,
    quizConfig: QuizConfig
) => {

    const defaultState: QuizState = {
        currentQuizIndex: 0,
        answers: [],
        showConfirm: false,
        showResult: false,
        fromConfirm: false,
        fromResult: false
    }

    const { t } = useI18n()
    // こちら随所で見られる実装ですが、共有化するのは難しいでしょうか。
    // こちらはvue-i18nのパッケージ依存の処理になります。コンポーネントのプロパティーの設定がそれぞれ違うため、共通化は難しいです。。

    const {
        updateQuestionResult,
        changeSceneCompleteState,
    } = usePlckStore()

    const {
        currentSuspendDataState,
        currentFrameIndex,
        isLastFrame,
    } = storeToRefs(usePlckStore())


    const sessionNameQuizStateAnswer = `${sceneName}/QuizStateAnswer`
    const sessionQuizStateAnswerString: string = sessionStorage.getItem(sessionNameQuizStateAnswer)
    const sessionQuizStateAnswer: any[] = sessionQuizStateAnswerString ? JSON.parse(sessionQuizStateAnswerString) : []
    if (sessionQuizStateAnswer.length) {
        defaultState.answers = sessionQuizStateAnswer
    } else {
        defaultState.answers = quizConfig.questions.map((question) => question.alternatively === 'multiple' ? [] : null)
    }
    /**
     * クイズページの状態管理
     */
    const quizState = reactive<QuizState>(defaultState)

    /**
     * 現在表示されているクイズ
     */
    const currentQuiz = ref<QuizQuestion>(quizConfig.questions[quizState.currentQuizIndex])

    const sessionName = `${sceneName}/AnswerResult`
    const sessionAnswerResultString: string = sessionStorage.getItem(sessionName)
    const sessionAnswerResult: QuestionResultData[] = sessionAnswerResultString ? JSON.parse(sessionAnswerResultString) : []


    /**
     * クイズ回答データ
     * セッションに保存されていればそれを参照
     */
    const answerResults = ref<QuestionResultData[]>(sessionAnswerResult)

    /**
     * i18nに登録された文字列で作られたQuizQuestionの一覧を生成
     */
    const questions = computed<QuizQuestion[]>(() => {
        const questionLength = quizConfig.questions.length
        const result = []

        for (let i = 0; i < questionLength; i++) {
            const label = `${sceneName}_question_${i}`
            const quizType = quizConfig.questions[i].quiz_type
            const alternatively = quizConfig.questions[i].alternatively

            const target = {
                title: t(`${label}_title`),
                quiz_text: t(`${label}_quiz_text`),
                explanation: t(`${label}_explanation`),
                quiz_type: quizType,
                alternatively,
            } as QuizQuestion

            //各言語ごとの回答の文字列
            const correctStr = t(`${label}_correct`)

            /**
             * 各言語ごとの回答の処理
             * vue-i18nに回答情報を文字列として保存しているため、
             * そこから値を復帰させる
             * 文字列の場合はそのまま
             * 数値の場合は数値にパース
             * 配列の場合はJSON.parse
             */
            if (quizType === 'select') {
                // 各選択肢の実体化
                target.choices = quizConfig.questions[i].choices.map((val, i) => t(`${label}_choice_${i}`))
                if (alternatively === 'multiple') {
                    target.correct = JSON.parse(correctStr)
                } else {
                    target.correct = parseInt(correctStr)
                }
            }

            if (quizType === 'text') {
                // 穴埋め問題の内容
                target.text = t(`${label}_text`)
                if (alternatively === 'multiple') {
                    target.correct = JSON.parse(correctStr)
                } else {
                    target.correct = correctStr
                }
            }

            // 回答
            result.push(target as QuizQuestion)
        }

        return result
    })

    /**
     * 表示対象のクイズ
     */
    const currentLocaleQuiz = computed(() => {
        return questions.value[quizState.currentQuizIndex]
    })

    /**
     * クイズの得点（100点満点）
     * クイズの得点は、クイズが全て回答された後に計算する
     * 評価時、
     * undefined = まだ全てのクイズの回答が終わっていない
     * 0 ~ 100 クイズの結果
     * となるため、falsyな評価をするときは注意
     */
    const currentScore = computed<number|undefined>(() => {
        const answeredLength = answerResults.value.length
        const questionLength = quizConfig.questions.length
        // まだ回答していない場合はundefinedを返却
        if (answeredLength < questionLength) return undefined
        // 正解したクイズの数を取得
        const correctLength = answerResults.value.reduce((val, result) => {
            if (result.result) val++
            return val
        }, 0)
        return Math.round(correctLength / questionLength  * 100);
    })


    /**
     * 現在表示されているクイズの結果情報
     * まだ完了していない場合はundefined
     */
    const currentAnswerResult = computed<QuestionResultData>(() => {
        if (answerResults.value) {
            return answerResults.value[quizState.currentQuizIndex]
        }
        return undefined
    })

    /**
     * 全てのクイズに回答し、結果がでたかどうか
     */
    const isAnsweredAllQuestions = computed<boolean>(() => {
        return answerResults.value.length === quizLength.value
    })

    /**
     * 最後のクイズの項目かどうか
     */
    const isLastQuestion = computed<boolean>(() => {
        return quizState.currentQuizIndex + 1 === quizConfig.questions.length
    })

    const isMultiple = computed<boolean>(() => {
        return currentLocaleQuiz.value.alternatively === 'multiple'
    })

    /**
     * 現在表示されているクイズの回答情報
     * すでに採点済の場合はその情報を表示する
     */
    const currentSelectedAnswer = computed({
        get() {
            if (currentAnswerResult.value) {
                return currentAnswerResult.value.selectedAnswer
            }
            const answer = quizState.answers[quizState.currentQuizIndex]
            if (answer) return answer
            const targetQuestion = quizConfig.questions[quizState.currentQuizIndex]
            /**
             * もし回答が複数(multiple)の場合の処理
             */
            if (!answer && targetQuestion.alternatively === 'multiple') {
                if (Array.isArray(targetQuestion.correct)) {
                    // textが複数の場合はそれぞれの文字列を空で渡す必要があるため各項目の空文字列を配列に含める
                    if (targetQuestion.quiz_type === 'text') return targetQuestion.correct.map(() => '')
                    return []
                }
            }
            return answer
        },
        set(value) {
            // console.log("currentSelectedAnswer:set", value)
            quizState.answers[quizState.currentQuizIndex] = value
            sessionStorage.setItem(sessionNameQuizStateAnswer, JSON.stringify(quizState.answers))
        }
    })

    const showResultState = computed<boolean>(() => {
        return quizState.showResult
    })

    /**
     * クイズ画面を表示するかどうか
     */
    const showQuiz = computed<boolean>(() => {
        return !quizState.showConfirm && !quizState.showResult
    })

    /**
     * 確認画面を表示するかどうか
     */
    const showConfirm = computed<boolean>(() => {
        return quizState.showConfirm
    })

    /**
     * 結果画面を表示するかどうか
     */
    const showResult = computed<boolean>(() => {
        return quizState.showResult
    })

    /**
     * 合格不合格を表示するかどうか
     */
    const showPass = computed<boolean>(() => {
        return quizConfig.display_pass === 'on'
    })

    /**
     * 点数を表示するかどうか
     */
    const showScore = computed<boolean>(() => {
        return quizConfig.display_score === 'on'
    })

    /**
     * 次へのボタンを表示
     * 条件:
     * 最後のクイズの場合は非表示
     * Q&Aの場合...当該のクイズがすでに回答済の場合は表示
     * All&Aの場合...常に表示
     */
    const showNextButton = computed<boolean>(() => {
        if (isLastQuestion.value) return false
        if (quizConfig.questions_type === 'Q&A' && !isLastQuestion.value) {
            return !!currentAnswerResult.value
        }
        else if (quizConfig.questions_type === 'All&A' && !isLastQuestion.value) {
            return true
        }
        return false
    })

    const showPrevButton = computed<boolean>(() => {
        if (quizConfig.questions_type === 'All&A') {
            return quizState.currentQuizIndex !== 0
        }
        return false
    })

    /**
     * 回答ボタンを表示
     * 条件: 当該のクイズが回答済でないかつquestions_typeがQ&Aの場合
     */
    const showAnswerButton = computed<boolean>(() => {
        return !currentAnswerResult.value && quizConfig.questions_type === 'Q&A'
    })


    /**
     * 結果画面へのボタンを表示
     * 条件: Q&Aかつ最後のページかつ回答済の場合表示
     */
    const showResultButton = computed<boolean>(() => {
        return currentAnswerResult.value && quizConfig.questions_type === 'Q&A' && isLastQuestion.value
    })

    /**
     * 確認画面へのボタンを表示
     * 条件: All&Aかつの最後ページの場合表示
     */
    const showConfirmButton = computed<boolean>(() => {
        return quizConfig.questions_type === 'All&A' && isLastQuestion.value
    })


    /**
     * 再挑戦ボタンを表示
     * 条件: quizConfig.retryがonになっているか
     */
    const showRetryButton = computed<boolean>(() => {
        return quizConfig.retry === 'on' && !isPassed.value
    })

    const isBlockToNextWhenRetry = computed<boolean>(() => {
        return showRetryButton.value && quizConfig.block_next_when_retry === 'on'
    })

    const isDoMark = computed<boolean>(() => {
        return quizConfig.domark === 'on'
    })


    const quizLength = computed(() => {
        return quizConfig.questions.length
    })


    // label
    const labelButtonRetry = computed(() => {
        return t(`${sceneName}_retry_btn_name`)
    })

    const labelButtonAnswer = computed(() => {
        return t(`${sceneName}_btn_answer_name`)
    })

    const labelButtonConfirm = computed(() => {
        return t(`${sceneName}_btn_confirm_name`)
    })

    const labelButtonMark = computed(() => {
        return t(`${sceneName}_btn_mark_name`)
    })

    const labelButtonNext = computed(() => {
        return t(`${sceneName}_btn_next_name`)
    })

    const labelButtonPrev = computed(() => {
        return t(`${sceneName}_btn_prev_name`)
    })

    const labelMaru = computed(() => {
        return t(`${sceneName}_maru_text`)
    })

    const labelBatsu = computed(() => {
        return t(`${sceneName}_batsu_text`)
    })

    const labelPassed = computed(() => {
        return t(`${sceneName}_passed_text`)
    })

    const labelFailure = computed(() => {
        return t(`${sceneName}_failure_text`)
    })

    const labelTableResult = computed(() => {
        return t(`${sceneName}_table_result_text`)
    })

    const labelTableAnswer = computed(() => {
        return t(`${sceneName}_table_answer_text`)
    })

    const labelTableMaru = computed(() => {
        return t(`${sceneName}_table_maru_text`)
    })

    const labelTableBatsu = computed(() => {
        return t(`${sceneName}_table_batsu_text`)
    })

    const labelConfirmTableDescription = computed(() => {
        return t(`${sceneName}_confirm_table_description_text`)
    })

    const labelMarkTableDescription = computed(() => {
        return t(`${sceneName}_mark_table_description_text`)
    })

    const labelGuide = computed(() => {
        return t(`${sceneName}_guide_pretext`)
    })

    const {
        btnLabelNextScene,
        btnLabelCloseUnit,
        btnLabelNextUnit,
        hasShowableButton,
    } = useSpecificButton(sceneName)


    /**
     * 採点するかどうか
     */
    const shouldMark = computed<boolean>(() => {
        return quizConfig.domark === 'on'
    })

    /**
     * クイズに合格しているかどうかを判定する
     */
    const isPassed = computed<boolean>(() => {
        // まだクイズの得点が出ていない場合はfalse
        if (currentScore.value === undefined) return false
        return currentScore.value >= quizConfig.passing_mark
    })

    /**
     * 表示されているクイズが正解だったかどうか
     */
    const currentQuizPassed = computed<boolean>(() => {
        if (currentAnswerResult.value) {
            return currentAnswerResult.value.result
        }
        return false
    })

    /**
     * クイズを選択をする
     * @param quizIndex
     */
    function changeCurrentQuiz(quizIndex: number) {
        quizState.currentQuizIndex = quizIndex
    }

    /**
     * 結果画面に移動する
     * 条件:全てのクイズの結果が登録されていること
     */
    function toResult() {
        if (answerResults.value.length === quizConfig.questions.length) {
            quizState.showResult = true
            // showConfirmもリセットしておく
            quizState.showConfirm = false
        }
    }

    /**
     * 確認画面から結果画面に移動する
     */
    function toResultFromConfirm() {
        quizState.answers.forEach((answer, i) => {
            console.log('mark!!!', answer)
            markQuestion(i, answer)
        })
        quizState.showResult = true
        // showConfirmもリセットしておく
        quizState.showConfirm = false
    }

    /**
     * 確認画面に移動する
     * 条件:question_typeがAll&Aの時だけ表示する
     */
    function toConfirm() {
        if (quizConfig.questions_type === 'All&A') {
            quizState.showConfirm = true
            // 一応showResultもリセットしておく
            quizState.showResult = false
        }
    }


    /**
     * 指定したインデックスのクイズに移動する
     * 現在表示されている画面に応じてfrom*を変更する
     * @param quizIndex
     */
    function toQuiz(quizIndex) {

        changeCurrentQuiz(quizIndex)

        // もし表示されている画面が確認画面なら
        if (quizState.showConfirm) {
            quizState.showConfirm = false
            quizState.fromConfirm = true
        }

        // もし表示されている画面が結果画面なら
        if (quizState.showResult) {
            quizState.showResult = false
            quizState.fromResult = true
        }
    }

    /**
     * クイズを再度受ける
     * 条件: 再受講が可能であり、かつ不合格であれば処理可能
     */
    function restartQuiz() {
        if (quizConfig.retry === 'on') {
            quizState.answers = []
            quizState.showResult = false
            quizState.fromResult = false
            quizState.showConfirm = false
            quizState.fromConfirm = false
            answerResults.value = []
            sessionStorage.removeItem(sessionName)
            toQuiz(0)
        }
    }


    /**
     *
     * @param quizIndex
     * @param selectedAnswer
     * @param result
     */
    function addAnswerResult(quizIndex: number, selectedAnswer, result: boolean) {
        answerResults.value[quizIndex] = {
            result,
            selectedAnswer
        }
        sessionStorage.setItem(sessionName, JSON.stringify(answerResults.value))
    }

    function markQuestion (quizIndex: number, selectedAnswer: any) {

        let result = true

        const quiz = quizConfig.questions[quizIndex]

        switch (quiz.alternatively) {
            case 'single':

                // 単一回答の場合のチェック
                if (selectedAnswer !== quiz.correct) result = false

                break;
            case 'multiple':
                // 複数回答の場合は、数とそれぞれの値が正しいかを判断する

                // 回答数が違う場合は 不正解
                if (selectedAnswer.length !== (quiz.correct as any[]).length) result = false

                // まだ正解でかつ..
                if (result) {
                    (selectedAnswer as any[]).forEach((answer, i) => {
                        // 回答がcorrectに含まれていなかったら 不正解
                        switch (quiz.quiz_type) {
                            case 'select':
                                if (!(quiz.correct as any[]).includes(answer)) result = false
                                break;
                            case 'text':
                                // quiz_typeがtextの場合、対応する配列番号の文字列と一致しなければ不正解
                                if ((quiz.correct as any[])[i] !== answer) result = false
                                break;
                        }
                    })
                }

                break;
        }

        addAnswerResult(quizIndex, selectedAnswer, result)
    }

    /**
     * 回答チェックを実行する
     */
    function answerQuestion() {
        const selectedAnswer = currentSelectedAnswer.value
        markQuestion(quizState.currentQuizIndex, selectedAnswer)
    }

    async function addAnswerResultsToSuspendData() {
        for (let i = 0; i < answerResults.value.length; i++) {
            const result = answerResults.value[i]
            await updateQuestionResult(currentFrameIndex.value, i, result.selectedAnswer, result.result)
        }
    }

    async function updateSuspendData() {
        await addAnswerResultsToSuspendData()

        const state: CompleteState = (() => {
            // もし採点しないようであればcompletedに指定する
            if (quizConfig.domark === 'off') return 'completed'
            // もし採点が必要なら、合格
            return isPassed.value ? 'completed' : 'not-completed'
        })()

        await changeSceneCompleteState(currentFrameIndex.value, state)
    }

    /**
     * 回答画面に移動した時に処理を実行
     * completed以外の場合は毎回updateSuspendDataを実行する
     */
    watch(showResultState, async (value, oldValue) => {
        // 回答画面に移動した際に処理
        console.log(value, oldValue)
        if (value && !oldValue) {
            if (!currentSuspendDataState.value || currentSuspendDataState.value.complete !== 'completed') {
                // console.log('updateSuspendData!!!!')
                await updateSuspendData()
            }
        }
    }, { deep: true })

    /**
     * domarkがoffの時は、isAnsweredAllQuestionsがtrueに変化した時に処理を行う
     */
    watch(isAnsweredAllQuestions, async (value, oldValue) => {
        if (quizConfig.domark === 'off' && value && !oldValue) {
            if (!currentSuspendDataState.value || currentSuspendDataState.value.complete !== 'completed') {
                await updateSuspendData()
            }
        }
    }, { deep: true })

    return {
        quizState,
        currentLocaleQuiz,

        // computed
        questions,
        currentQuiz,
        answerResults,
        currentAnswerResult,
        currentSelectedAnswer,
        currentQuizPassed,
        quizLength,
        isPassed,
        isMultiple,
        isBlockToNextWhenRetry,
        isDoMark,
        isLastFrame,
        isLastQuestion,
        isAnsweredAllQuestions,
        shouldMark,
        currentScore,

        showQuiz,
        showConfirm,
        showResult,
        showPrevButton,

        showNextButton,
        showAnswerButton,
        showResultButton,
        showConfirmButton,
        showScore,
        showPass,
        showRetryButton,

        // label
        labelBatsu,
        labelGuide,
        labelButtonAnswer,
        labelMaru,
        labelPassed,
        labelButtonRetry,
        labelButtonConfirm,
        labelButtonMark,
        labelButtonNext,
        labelButtonPrev,
        labelFailure,
        labelTableResult,
        labelTableAnswer,
        labelTableMaru,
        labelTableBatsu,
        labelConfirmTableDescription,
        labelMarkTableDescription,
        // 共通ボタンラベル
        btnLabelNextScene,
        btnLabelCloseUnit,
        btnLabelNextUnit,
        hasShowableButton,
        // methods
        toConfirm,
        toResult,
        toResultFromConfirm,
        toQuiz,
        answerQuestion,
        restartQuiz,
    }
}