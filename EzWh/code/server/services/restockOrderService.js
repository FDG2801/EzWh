class RestockOrderService {
    constructor(restockHandler, SKUHandler, SKUItemHandler, testResultHandler, itemHandler) {
        this.restockHandler = restockHandler;
        this.SKUHandler = SKUHandler;
        this.SKUItemHandler = SKUItemHandler;
        this.testResultHandler = testResultHandler;
        this.itemHandler = itemHandler
    }

    getAll = async () => {
        let restockOrders = undefined;
        restockOrders = await this.restockHandler.getAllOrders();
        const orderObject = this.generateOrderJSON(restockOrders);
        return orderObject;
    }

    getIssued = async () => {
        let restockOrders = undefined;
        restockOrders = await this.restockHandler.getIssuedOrders();
        const orderObject = this.generateOrderJSON(restockOrders);
        return orderObject;
    };

    findOrder = async (ID) => {
        let restockOrder = undefined;
        restockOrder = await this.restockHandler.getOrderByID(ID);
        if (restockOrder === undefined) return undefined;
        const orderObject = this.generateOrderJSON([restockOrder], true);
        return orderObject;
    };

    findOrderFromTable = async (ID) => {
        return await this.restockHandler.getOrderByID(ID);
    };

    findFailedSKU = async (ID) => {
        let resultArray = [];
        let skuItems = await this.restockHandler.getSKUItems(ID);
        let testResults = undefined;

        for (let skuitem of skuItems) {
            testResults = await this.testResultHandler.getAll(skuitem.RFID);
            if (testResults.some((test) => test.result === 0)) { // or 'false' as a string
                resultArray = [...resultArray, {
                    SKUId: skuitem.SKUId,
                    itemId: skuitem.itemid,
                    rfid: skuitem.RFID
                }];
            }
        }
        return resultArray;
    }

    addOrder = async (issuedate, products, supplierid) => {
        let itemPK = undefined;
        let addedOrderID = undefined;
        addedOrderID = await this.restockHandler.addRestockOrder(issuedate, supplierid);
        //console.log("bbbbb")
        for (let product of products) {
            console.log(product);
            itemPK = (await this.itemHandler.getSpecificItemByProps(product.itemId, product.SKUId, product.description, product.price, supplierid)).id;
            await this.restockHandler.addROProduct(addedOrderID.id, itemPK, product.qty);
        }
        return addedOrderID.id;
    }

    setState = async (ID, newState) => {
        return (await this.restockHandler.modifyStateByID(ID, newState)).id;
    }

    addSKUItems = async function (ID, newSKUItems) {
        for (let itemObj of newSKUItems) {
            await this.restockHandler.addROSKUItem(ID, itemObj.rfid, itemObj.SKUId, itemObj.itemId);
            //xd
        }
    }

    addTransportNote = async (ID, issuedate, deliverydate) => {
        // Convert date to integer and perform a comparison (possible because of the format YYYY-MM-DD)
        let issueDInt = parseInt(issuedate.replaceAll('/', ''));
        // parseInt ignores the Hour in issuedate because there's a whitespace character
        let deliveryDInt = parseInt(deliverydate.replaceAll('/', ''));
        if (deliveryDInt < issueDInt) {
            return false;
        }
        await this.restockHandler.addTransportNote(ID, deliverydate);
        return true;
    }

    deleteOrder = async function (ID) {
        await this.restockHandler.deleteOrder(ID);
        await this.restockHandler.deleteRestockProducts(ID);
        await this.restockHandler.deleteRestockSKUItems(ID);
    }

    generateOrderJSON = async (restockOrders, single=false) => {
        let rstProducts = undefined;
        let productsJSONlist = undefined;
        let productInfo = undefined;
    
        let skuJSONlist = undefined;
        let rstSKUItems = undefined;
        let skuitem = undefined;
    
        let orderJSON = undefined;
        let resultArray = [];
    
        for (let order of restockOrders) {
            // get items from RESTOCK_PRODUCTS
            rstProducts = await this.restockHandler.getProducts(order.ROID);
            // generate a list of JSON obj. with the required fields
            productsJSONlist = [];
            for (let product of rstProducts) {
                productInfo = await this.itemHandler.getFromPK(product.itemid_pk);
                if (productInfo === undefined) throw new Error(`Product: ${product.itemid_pk} not found in ITEMS table`);
                productsJSONlist = [...productsJSONlist, {
                    SKUId: productInfo.SKUId,
                    itemId: productInfo.itemid,
                    description: productInfo.description,
                    price: productInfo.price,
                    qty: product.quantity
                }];
            }
    
            // similar procedure to retrieve SKUId from SKU table for each element in RESTOCK_SKUITEMS
            rstSKUItems = await this.restockHandler.getSKUItems(order.ROID);
            skuJSONlist = [];
            for (skuitem of rstSKUItems) {
                skuJSONlist = [...skuJSONlist, {
                    SKUId: skuitem.SKUId,
                    itemId: skuitem.itemid,
                    rfid: skuitem.RFID
                }];
            }
    
            orderJSON = {
                id: order.ROID,
                issueDate: order.issuedate,
                state: order.state,
                products: productsJSONlist,
                supplierId: order.supplierid,
                transportNote: (order.tn_date ? { 'deliveryDate': order.tn_date } : {}),
                skuItems: skuJSONlist
            };
            if (single) return orderJSON;
            resultArray = [...resultArray, orderJSON];
        }
        return resultArray;
    }
}

module.exports = RestockOrderService;