import { describe, expect, it } from 'vitest'
import {toCamelCase} from "../../../helper/toCamelCase";

describe('toCamelCase', () => {

    it('-が正しくキャメルケースに変換されるかどうか', () => {

        const testStr = 'to-camel-string'
        const result = toCamelCase(testStr)
        // console.log(result)
        expect(result).toBe('ToCamelString')

    })

    it('_が正しくキャメルケースに変換されるかどうか', () => {

        const testStr = 'to_camel_string'
        const result = toCamelCase(testStr)
        // console.log(result)
        expect(result).toBe('ToCamelString')

    })

    it('-と_が混在しても正しくキャメルケースに変換されるかどうか', () => {

        const testStr = 'to-camel_string'
        const result = toCamelCase(testStr)
        // console.log(result)
        expect(result).toBe('ToCamelString')

    })

})