import { expect, it, describe } from "vitest";
import {objectFlattenKeyForI18n, objectFlatter} from "../../../helper/objectFlatter.ts";


describe('objectFlatter', () => {

    const target = {
        test: 'test',
        test2: true,
        testArray: [
            {
                test: 'object',
                detail: [ 'a', 'b', 'dc' ]
            },
            {
                test: 'object2',
                detail: ['d', 'e']
            }
        ],
        testObject: {
            to: {
                so: {
                    nested: {
                        object: 'here'
                    }
                }
            }
        }
    }


    it('objectFlatter: オブジェクトの階層構造を正しく平坦化する', () => {


        const result = objectFlatter(target)

        // console.log(result)

        expect(result['test']).toBe('test')
        expect(result['test2']).toBe(true)
        expect(result['testArray_0_test']).toBe('object')
        expect(result['testArray_0_detail_0']).toBe('a')
        expect(result['testArray_0_detail_1']).toBe('b')
        expect(result['testArray_0_detail_2']).toBe('dc')
        expect(result['testArray_1_test']).toBe('object2')
        expect(result['testArray_1_detail_0']).toBe('d')
        expect(result['testArray_1_detail_1']).toBe('e')
        expect(result['testObject_to_so_nested_object']).toBe('here')



    })

    it('objectFlattenKeyForI18n: オブジェクトの階層構造を正しく平坦化する', () => {


        const result = objectFlattenKeyForI18n(target, 'some-scene-name')

        // console.log(result)

        expect(result.test).toBe('some-scene-name_test')
        expect(result.test2).toBe('some-scene-name_test2')
        expect(result.testArray[0].test).toBe('some-scene-name_testArray_0_test')
        expect(result.testArray[0].detail[0]).toBe('some-scene-name_testArray_0_detail_0')
        expect(result.testArray[0].detail[1]).toBe('some-scene-name_testArray_0_detail_1')
        expect(result.testArray[0].detail[2]).toBe('some-scene-name_testArray_0_detail_2')
        expect(result.testArray[1].test).toBe('some-scene-name_testArray_1_test')
        expect(result.testArray[1].detail[0]).toBe('some-scene-name_testArray_1_detail_0')
        expect(result.testArray[1].detail[1]).toBe('some-scene-name_testArray_1_detail_1')
        expect(result.testObject.to.so.nested.object).toBe('some-scene-name_testObject_to_so_nested_object')



    })

})