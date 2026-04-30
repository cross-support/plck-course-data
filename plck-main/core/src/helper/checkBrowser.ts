import {getDeviceName} from "@/helper/getDeviceName.ts";
import {getBrowserName} from "@/helper/getBrowsername.ts";

const ANDROID_SUPPORT_MIN_VERSION = 4.2

export const checkBrowser = (): boolean => {
	// この関数ってどこで使用されてますか？
	// 回答: 当初使用を前提に移植しましたが、処理を整理していく中で不要の処理となりました。（動作確認の処理）
	// ただ、まだ何かに使えるかもなので一旦置いておいても良いかも？と思っています。

	//ユーザーエージェント取得
	const _ua = navigator.userAgent;
	//デバイス名取得
	const deviceName = getDeviceName();
	//ブラウザ名取得
	const browserName = getBrowserName();
	//バージョン情報
	let version: number = null;

	//iPhone,iPadの場合
	if(deviceName == "iPhone" || deviceName == "iPad") {
		return browserName === "Safari"
	//Androidの場合
	} else if(deviceName == "Android") {
		if(browserName == "Chrome" || browserName == "Linux") {
			version = parseFloat(_ua.slice(_ua.indexOf("Android")+8));
			return version >= ANDROID_SUPPORT_MIN_VERSION;
			// ANDROID_SUPPORT_MIN_VERSION みたいなconstにしておいて頂けますでしょうか。
			// 回答: 修正しました。
		} else {
			return false;
		}
	//Macの場合
	} else if(deviceName == "Macintosh") {
		return browserName == "Firefox" || browserName == "Chrome" || browserName == "Safari";
	//Windowsの場合
	} else {
		if(browserName == "Trident") {
			return true;
		//IE11未満の場合
		} else if(browserName == "MSIE") {
			return false;
		} else if(browserName == "Firefox") {
			return true;
		} else {
            return browserName == "Chrome";
        }
	}
}