class testDescriptorService
{
    dao;

    constructor(dao)
    {
        this.dao=dao;
    }

    getTestDescriptors= async()=>
    {
        const result=await this.dao.getAll();
        return result;
    }

    findTestDescriptor= async(id)=>
    {
        const result=await this.dao.find(id);
        let TestDescriptor=undefined;
        if(result!=undefined)
        {
            TestDescriptor={
                id:result.id,
                name:result.name,
                procedureDescription:result.procedureDescription,
                idSKU:result.idSKU
          }
        }
        return TestDescriptor;
    }

    addTestDescriptor= async(name,procedureDescription,idSKU)=>
    {
        const result=await this.dao.addTESTDESCRIPTOR(name,procedureDescription,idSKU)
        return result;
    }

    updateTestDescriptor= async(id,name,procedureDescription,idSKU)=>
    {
        //check TestDescriptor exists
        const testDescriptor=await this.findTestDescriptor(id);
        console.log(testDescriptor)
        if(testDescriptor===undefined)
            return -1;

        const result=await this.dao.updateTESTDESCRIPTOR(id,name,procedureDescription,idSKU)
        return result;
    }

    deleteTestDescriptor= async(id)=>
    {
         //check TestDescriptor exists
         const testDescriptor=await this.findTestDescriptor(id);
         if(testDescriptor===undefined)
             return -1;

        const result=await this.dao.deleteTESTDESCRIPTOR(id);
        if (result !== true) {
            return false;
        } 
        return true;
    }

}

module.exports=testDescriptorService;