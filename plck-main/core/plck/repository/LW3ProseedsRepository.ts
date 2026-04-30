import IProseedsRepository from "./IProseedsRepository";
import util from './util'
import {ControllerData} from "./repository.type";
import {SuspendData} from "./SuspendData";


export default class LW3ProseedsRepository implements IProseedsRepository{


    private rootUrl: string;
    private userLearningLessonId: number | string;
    private unitId: number | string;
    private lecturePathSortNo: number | string;

    private api = {
        lesson: {
            SetComplete: "api/lesson/set-unit-complete" //ユニット修了書込
            , GetComplete: "api/lesson/get-unit-complete" //ユニット修了取得
            , GetControllerData: "api/lesson/controller-data" //コントローラの値を取得
            // TODO: LW3では使っていない可能性あり
            , UnitDataAPI: "api/lesson/unit-data" //ユニット情報の書込・取得
            , SetSuspendData: "api/lesson/set-unit-suspend-data" //中断情報の書込
            , GetSuspendData: "api/lesson/get-unit-suspend-data" //中断情報の読込
        },
        user: {
            UserDataAPI: "api/user/user-data" //ユーザー情報の取得
        }
    }


    constructor(parameter) {
        this.rootUrl = parameter.Root
        this.userLearningLessonId = parameter.UserLearningLessonId
        this.unitId = parameter.UnitId
        this.lecturePathSortNo = parameter.lecturePathSortNo
    }


    jsonp(url, data, callback, onerror) {

        try {
            //iFrameでJSONPを読み込み
            const ifr = document.createElement("iframe");
            ifr.style.display = "none";
            document.body.appendChild(ifr);

            const doc = ifr.contentWindow.document as Document & { x: any };

            ifr.onload = function () {

                if (doc.x) {
                    if (callback) {
                        console.log('util.jsonp: beforeCallback',  this, doc, doc.x)
                        callback.apply(this, doc.x);
                    }
                } else if (onerror) {
                    onerror();
                }

                setTimeout(function () {
                    try {
                        ifr.parentNode.removeChild(ifr);
                    } catch (ex) {
                        console.error(ex)
                    }
                }, 0);
            };

            //データを送信する
            //データ整形
            const query = util.getRequestParameter("get", data);
            let code = "&";

            if (url.indexOf("?") < 0) {
                code = "?";
            }

            //キャッシュ対策
            const rnd = Math.floor(Math.random() * 1000);
            url = url + code + "rnd=" + rnd;

            if (query) {
                url = url + "&" + query;
            }

            doc.write("<scr" + "ipt>function importJSON(){document.x=arguments}</scr" + "ipt>" +
                "<scr" + 'ipt src="' + url + '"></scr' + "ipt>");

            doc.close();
            return ifr;
        } catch (ex) {
            if (onerror) {
                onerror(ex);
            }
        }
    }

    ajax(method = 'get', url, async = false, data, callback) {

        //宣言
        let req;
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = null;
        }

        //メソッド, URL, 同期フラグ を指定する
        req.open(method, url, async);

        //onreadystateイベントハンドラ属性に関数をセット
        req.onreadystatechange = onReadystatechange;

        //キャッシュを無効にする
        req.setRequestHeader("Pragma", "no-cache");
        req.setRequestHeader("Cache-Control", "no-cache");
        req.setRequestHeader("If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT");

        if (method == "post") {

            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }

        //データを送信する
        //データ整形
        const requestParameter = util.getRequestParameter(method, data);
        try {
            req.send(requestParameter);
        } catch (ex) {
            if (callback) {
                callback(false);
            }
        }
        //readystate(XMLHttpRequestオブジェクトを準備する状態) が変化した時に呼ばれる関数
        function onReadystatechange() {

            //readyStateをチェック
            //http://www.w3.org/TR/XMLHttpRequest/#states
            //readyState === 4 はデータ読み込みが完了した状態
            if (req.readyState === 4) {
                if (callback) {
                    console.log('util.ajax Callback:', req)
                    callback(req);
                }

                //onreadystatechangeイベントハンドラ属性に空のFunctionオブジェクトを代入
                //イベントハンドラ属性を初期化することで、IE6のメモリリークを回避する。
                req.onreadystatechange = new Function;

                //ActiveX() が生成するXMLHttpRequest互換オブジェクトをクロージャが参照を保持すると IE6 で循環参照(メモリリーク) するので、null で埋めて回避しておく
                req = method = url = async = data = null;
            }
        }
    }

    /**
     * 移植元
     * old/source/js/proseeds_LW3.js:326
     * 初期化という形でgetControllerDataのエンドポイントにアクセスしていた
     * TODO: 元の実装だとエラーのときにもcallbackを実行していたのでエラーの時は一旦rejectを返すように変更し様子を見る。問題があればもとの実装のようにする
     * 元の実装だと、各パラメーターは初期化処理をおこないメンバ変数としていたが、
     * 初期化処理のタイミングなどがわかりづらいかつ、どのようなプロパティーを取り扱うかが明示的でないため関数の引数からとるように修正
     */
    getControllerData(): Promise<ControllerData> {

        return new Promise((resolve, reject) => {

            this.jsonp(
                this.rootUrl + this.api.lesson.GetControllerData,
                {
                    UserLearningLessonId: this.userLearningLessonId,
                    UnitId: this.unitId,
                    Root: this.rootUrl,
                    LecturePathSortNo: this.lecturePathSortNo
                },
                (res) => {
                    try {
                        if (!res) {
                            reject(new Error("ER_101"));
                        } else {

                            const state = res();

                            if (!state) {
                                reject(new Error("ER_102"));
                            } else {
                                if (state.result != 'success') {
                                    reject(new Error(state.result.errcode));
                                }
                                resolve(state)
                            }
                        }
                    } catch (ex) {
                        reject(ex)
                    }
                },
                (e) => {
                    reject(e)
                }
            )

        })

    }

    /**
     * 移植元
     * old/source/js/proseeds_LW3.js:459
     * TODO: 元の実装だとエラーのときにもcallbackを実行していたのでエラーの時は一旦rejectを返すように変更し様子を見る。問題があればもとの実装のようにする
     * 元の実装だと、各パラメーターは初期化処理をおこないメンバ変数としていたが、
     * 初期化処理のタイミングなどがわかりづらいかつ、どのようなプロパティーを取り扱うかが明示的でないため関数の引数からとるように修正
     */
    getSuspendData(): Promise<SuspendData> {
        return new Promise((resolve, reject) => {
            this.jsonp(
                this.rootUrl + this.api.lesson.GetSuspendData,
                {
                    UserLearningLessonId: this.userLearningLessonId,
                    UnitId: this.unitId,
                    LecturePathSortNo: this.lecturePathSortNo,
                },
                (res) => {
                    const resobj = res();
                    console.log('---------')
                    console.log(resobj)
                    console.log('---------')
                    resolve(new SuspendData(resobj.suspendData));
                },
                (err) => {
                    reject(err)
                })
        })
    }

    /**
     * 移植元
     * old/source/js/proseeds_LW3.js:376
     * TODO: 元の実装だとエラーのときにもcallbackを実行していたのでエラーの時は一旦rejectを返すように変更し様子を見る。問題があればもとの実装のようにする
     * 元の実装だと、各パラメーターは初期化処理をおこないメンバ変数としていたが、
     * 初期化処理のタイミングなどがわかりづらいかつ、どのようなプロパティーを取り扱うかが明示的でないため関数の引数からとるように修正
     */
    setCompleteUnit(): Promise<boolean> {
        return new Promise((resolve, reject) => {

            this.jsonp(
                this.rootUrl + this.api.lesson.SetComplete,
                {
                    UserLearningLessonId: this.userLearningLessonId,
                    UnitId: this.unitId,
                    LecturePathSortNo: this.lecturePathSortNo
                },
                (res) => {
                    if(!res){
                        resolve(false);
                        return false;
                    }
                    try {
                        const resobj = res();
                        resolve(resobj && resobj.result == 'success');
                    } catch (e) {
                        console.log('SetComplete jsonp:error', e)
                        resolve(false);
                        return false;
                    }
                },
                (e) => {
                    //
                    reject(e)
                })
        })
    }

    /**
     * 移植元
     * old/source/js/proseeds_LW3.js:423
     * 一時保存データ書込(jsonp用)
     * TODO: 元の実装だとエラーのときにもcallbackを実行していたのでエラーの時は一旦rejectを返すように変更し様子を見る。問題があればもとの実装のようにする
     * 元の実装だと、各パラメーターは初期化処理をおこないメンバ変数としていたが、
     * 初期化処理のタイミングなどがわかりづらいかつ、どのようなプロパティーを取り扱うかが明示的でないため関数の引数からとるように修正
     * @param suspendData {SuspendData}
     */
    setSuspendData(suspendData: SuspendData): Promise<any> {

        return new Promise((resolve, reject) => {


            this.jsonp(
                this.rootUrl + this.api.lesson.SetSuspendData,
                {
                    UserLearningLessonId: this.userLearningLessonId,
                    UnitId: this.unitId,
                    SuspendData: suspendData.createSuspendDataString()
                },
                (res) => {
                    const resobj = res();
                    resolve(resobj && resobj.result == 'success');
                },
                (e) => {
                    reject(e)
                }
            )

        })
    }

}