import {ISceneFactory} from "./ISceneFactory";
import IStorage from "../../storage/IStorage";
import {SceneType} from "../../components/scene/Scene.type";
import VideoScene from "../../components/scene/scene/video/VideoScene";
import IScene from "../../components/scene/scene/IScene";
import {SceneConfig} from "../../components/scene/config/SceneConfig";
import {ISceneConfig} from "../../components/scene/config/ISceneConfig";
import {SceneJs} from "../../components/scene/js/SceneJs";
import {SceneStyle} from "../../components/scene/style/SceneStyle";
import {IPLCKConfig} from "../../config/IPLCKConfig";
import {SceneTemplate} from "../../components/scene/template/SceneTemplate";
import {VideoConfigPerLocale} from "../../components/scene/scene/video/video.type";
import {SceneHtml} from "../../components/scene/html/SceneHtml";
import {HtmlScene} from "../../components/scene/scene/html/HtmlScene.ts";
import {HtmlConfigPerLocale} from "../../components/scene/scene/html/html.type.ts";
import QuizScene from "../../components/scene/scene/quiz/QuizScene.ts";
import {QuizConfigPerLocale} from "../../components/scene/scene/quiz/quiz.type.ts";
import SlideScene from "../../components/scene/scene/slide/SlideScene.ts";
import {SlideConfigPerLocale} from "../../components/scene/scene/slide/slide.type.ts";
import {ChatScene} from "../../components/scene/scene/chat/ChatScene.ts";

export class SceneFactory implements ISceneFactory {

    private readonly storage: IStorage;
    private plckConfig: IPLCKConfig;
    private templateStorage: IStorage;

    constructor(storage: IStorage, templateStorage: IStorage, plckConfig: IPLCKConfig) {
        this.storage = storage
        this.templateStorage = templateStorage
        this.plckConfig = plckConfig
    }

    async generate(type: SceneType, name: string): Promise<{ scene: IScene, config: {} }> {

        const sceneConfig = new SceneConfig(type, name, this.storage)
        const config = await sceneConfig.load()

        let scene = null

        let js, html, style, template

        switch (type) {
            // 重複した処理が見受けられるので整理お願いします。
            // 回答: こちらの処理についてですが、ファクトリーパターンで各シーンに応じたISceneを作成する処理となっています。
            // そのため各シーンで必要なコンストラクタの引数が変わり、初期化の手順がそれぞれ違ってきます。（そこを吸収する意味でのファクトリーパターンの実装）
            // そのためここを共通化したりするのは難しいかつ、むしろ各シーン毎に必要な引数のオブジェクト明示して説明的に記述した方が可読性が高いと思いますので、できればこのままの実装が良いです。
            case 'video':
                js = new SceneJs(type, name, this.storage)
                style = new SceneStyle(type, name, this.storage)
                template = new SceneTemplate(this.templateStorage, 'video')
                scene = new VideoScene(name, this.plckConfig, config as VideoConfigPerLocale, js, style, template)
            break
            case 'html':
                html = new SceneHtml(type, name, this.storage)
                js = new SceneJs(type, name, this.storage)
                template = new SceneTemplate(this.templateStorage, 'html')
                scene = new HtmlScene(name, this.plckConfig, config as HtmlConfigPerLocale, js, html, template)
            break
            case 'chat':
                /**
                 * HTMLのシーンをもとにchatのhtml.vueおよびjsを取得する
                 * テンプレートはhtmlのtemplate.vue.ejsを使用
                 */
                html = new SceneHtml(type, name, this.storage)
                js = new SceneJs(type, name, this.storage)
                template = new SceneTemplate(this.templateStorage, 'html')
                scene = new ChatScene(name, this.plckConfig, config as HtmlConfigPerLocale, js, html, template)
                break
            case 'quiz':
                js = new SceneJs(type, name, this.storage)
                style = new SceneStyle(type, name, this.storage)
                template = new SceneTemplate(this.templateStorage, 'quiz')
                scene = new QuizScene(name, this.plckConfig, config as QuizConfigPerLocale, js, style, template)
            break
            case 'slide':
                js = new SceneJs(type, name, this.storage)
                style = new SceneStyle(type, name, this.storage)
                template = new SceneTemplate(this.templateStorage, 'slide')
                scene = new SlideScene(name, this.plckConfig, config as SlideConfigPerLocale, js, style, template)
            break

        }

        if (!scene) throw new Error(`指定されたシーンタイプ${type}は存在しません`)

        return {
            scene,
            config
        }

    }

}