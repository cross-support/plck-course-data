
type DeviceName = "iPhone" | "Android" | "iPad" | "Macintosh" | ""

export const getDeviceName = (): DeviceName => {
	//ユーザーエージェント取得
	const _ua = navigator.userAgent;
	//デバイス一覧
	const device = ["iPhone", "Android", "iPad", "Macintosh"];
	//デバイス名の取得
	let deviceName: DeviceName = "";
	for (const i in device) {
		const ua = window.navigator.userAgent.toLowerCase();
		if(ua.indexOf('macintosh') > -1 && 'ontouchend' in document) {
			deviceName = 'iPad';
			break;
		}
		const pattern = new RegExp(device[i], "i");
		//一致したブラウザ名を入れる
		if (pattern.test(_ua)) {
			deviceName = device[i] as DeviceName;
			break;
		}
	}
	return deviceName;
	// こちら想定していないデバイスからアクセスした場合、空文字が返る可能性がありますかね。そのエラーハンドリングをお願いしたいです。
	// 回答: useVideo.tsで、空文字列を想定した処理を行っているので、現状はその仕様で問題ないかと思います。
	// useVideo.tsでも記載しましたが、もともとの実装を参考にしているため、一旦このままの移植が良いかと思っております。。（どのような影響があるかわからないため。。）
}