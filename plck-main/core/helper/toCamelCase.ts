/**
 * スネークケースやケバブケースをキャメルケースに変更する
 * 例: to-camel-string -> ToCamelString
 * 例2: to_camel_string -> ToCamelString
 * @param str
 */
export function toCamelCase(str: string): string {

    const _str = str.replace(/(-|_)/g, '-')

    return _str.split('-').map(function(word){
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');

}
