class testResultService
{
    dao;
    constructor(dao)
    {
        this.dao=dao;
    }

    getTestResults= async(rfid)=>
    {
        const result=await this.dao.getAll(rfid);
        const testResults=result.map((result)=>(
        {
            id:result.id,
            idTestDescriptor:result.IdTestDescriptor,
            Date:result.date,
            Result:result.result
        }))
        return testResults;
    }

    findTestResult= async(rfid,id)=>
    {
        const result=await this.dao.find(rfid,id);
        let testResult=undefined;
        if(result!=undefined)
        {
         testResult=
            {
                id:result.id,
                idTestDescriptor:result.IdTestDescriptor,
                Date:result.date,
                Result:result.result
            }
        }
        return testResult;
    }

    addTestResult= async(rfid,idTestDescriptor,Date,Result)=>
    {
        const result=await this.dao.addTESTRESULT(rfid,idTestDescriptor,Date,Result)
        return result;
    }

    updateTestResult= async(rfid,id,idTestDescriptor,Date,Result)=>
    {
        const testResult=await this.findTestResult(rfid,id);
        if(testResult===undefined)
            return -1;

        const result=await this.dao.updateTESTRESULT(id,rfid,idTestDescriptor,Date,Result)
        console.log(result)
        return result;
    }

    deleteTestResult= async(rfid,id)=>
    {
         //check TestResult exists
         const testResult=await this.findTestResult(rfid,id);
         if(testResult===undefined)
             return -1;

        const result=await this.dao.deleteTESTRESULT(rfid,id);
        if (result !== true) {
            return false;
        } 
        return true;
    }
}

module.exports=testResultService;