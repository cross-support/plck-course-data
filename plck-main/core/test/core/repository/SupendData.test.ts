import { describe, it, expect } from "vitest";
import {SuspendData} from "../../../plck/repository/SuspendData";


describe('SuspendData', () => {


    it('文字列からのパース処理が正しく行われること', () => {

        const testStr = '{complete:true},{complete:true},{complete:true},{complete:false/qresult:false,3|false,4|true,1|true,2|false,選択肢|true,1+2},{complete:true},{},{},{},{},{},{},last_open_page:4'
        const suspendData = new SuspendData(testStr)
        console.log(suspendData.createSuspendDataString())
        console.log(suspendData.getStates())
        // expect(suspendData.getStates())


    })


})
