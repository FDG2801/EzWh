USER -> BB newUser (done), login (done), modify rights (done) || integration addNewUser, modifyRights - ok
POSITION -> BB modify position by id (done), delete position (done) || integration modifyPositionByID - ok
ITEM -> BB getSpecificItem (done), checkExistingItembyId || integration getSpecificItem createNewItem - ok

RESTOCKORDER -> modify state by id, add transport note, addROitem || integration newRestockOrder, getOrderbyId getReturnItems, addSkuItemsByID, addTransportNote

INTERNALORDER -> add internal order, get products by id || integration getInternalOrderByid modifyorderstate
RETURN ORDER -> return order by id, add return order ||  integration addReturnOrder getReturnOrderByid 

SKU -> add SKU, set position || (integration) setPosition, updateSKU
SKUITEM -> updateSKUItem, addSKUItem, getByskuID || (integration) none
TESTDESCRIPTOR -> addTestDescriptor, getBySKUId || (integration) none
TESTRESULT -> updateTestREsult, deleteTestResult || (integration) addTestResult