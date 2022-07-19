class InternalOrderService {

    constructor(internalOrderHandler) {
        this.internalOrderHandler = internalOrderHandler;
    }


    getInternalOrders = async () => {
        let InternalOrders = await this.internalOrderHandler.getAllInternalOrders();
        let items = [];
        let iorder = [];
        //correggi return order

        for (let order of InternalOrders) {
            items = await this.internalOrderHandler.getProductsByID(order.IOID, order.STATE);
            let products = [];
            for (let item of items) {
                if (order.STATE == "COMPLETED") {
                    products.push({ "SKUId": item.SKUID, "description": item.DESCRIPTION, "price": item.PRICE, "RFID": item.RFID })
                } else {
                    products.push({ "SKUId": item.SKUID, "description": item.DESCRIPTION, "price": item.PRICE, "qty": item.QUANTITY })
                }
            }
            iorder.push({
                "id": order.IOID,
                "issueDate": order.ISSUEDATE,
                "state": order.STATE,
                "products": products,
                "customerId": order.CUSTOMERID,
            })
        }
        return iorder;
    }

    getInternalOrdersIssued = async () => {
        let InternalOrders = await this.internalOrderHandler.getAllInternalOrders();
        console.log(InternalOrders[0]);
        let items = [];
        let iorder = [];
        //correggi return order

        for (let order of InternalOrders) {

            let products = [];
            if (order.STATE == "ISSUED") {
                items = await this.internalOrderHandler.getProductsByID(order.IOID, order.STATE);
                for (let item of items) {
                    products.push({ "SKUId": item.SKUID, "description": item.DESCRIPTION, "price": item.PRICE, "qty": item.QUANTITY })
                }

                iorder.push({
                    "id": order.IOID,
                    "issueDate": order.ISSUEDATE,
                    "state": order.STATE,
                    "products": products,
                    "customerId": order.CUSTOMERID,
                })
            }
        }
        return iorder;

    }

    getInternalOrdersAccepted = async () => {
        let InternalOrders = await this.internalOrderHandler.getAllInternalOrders();
        let items = [];
        let iorder = [];
        //correggi return order

        for (let order of InternalOrders) {
            let products = [];
            if (order.STATE == "ACCEPTED") {
                items = await this.internalOrderHandler.getProductsByID(order.IOID, order.STATE);
                for (let item of items) {
                    products.push({ "SKUId": item.SKUID, "description": item.DESCRIPTION, "price": item.PRICE, "qty": item.QUANTITY })
                }

                iorder.push({
                    "id": order.IOID,
                    "issueDate": order.ISSUEDATE,
                    "state": order.STATE,
                    "products": products,
                    "customerId": order.CUSTOMERID,
                })
            }
        }
        return iorder;
    }

    getInternalOrderByID = async (id) => {
        let order = await this.internalOrderHandler.getInternalOrderByID(id);
        let items = [];
        let iorder = [];
        let products = [];
        if(order===undefined) return []
        items = await this.internalOrderHandler.getProductsByID(order.IOID, order.STATE);

        for (let item of items) {
            if (order.STATE == "COMPLETED") {
                products.push({ "SKUId": item.SKUID, "description": item.DESCRIPTION, "price": item.PRICE, "RFID": item.RFID })
            } else {
                products.push({ "SKUId": item.SKUID, "description": item.DESCRIPTION, "price": item.PRICE, "qty": item.QUANTITY })
            }
        }

        if(items.length==1) products = products[0]; 

        iorder.push({
            "id": order.IOID,
            "issueDate": order.ISSUEDATE,
            "state": order.STATE,
            "products": products,
            "customerId": order.CUSTOMERID,
        })
        if(iorder.length==1) iorder = iorder[0]; 
        return iorder;
    }

    postInternalOrders = async (issueDate, products, customerId) => {
        let OrderId = undefined;

        OrderId = await this.internalOrderHandler.addInternalOrder(issueDate.format('YYYY-MM-DD HH:mm'), customerId);
        //add items
        for (let item of products) {
            //need to call sku to see if rfid exists
            await this.internalOrderHandler.addIOtem(OrderId.id, item.SKUId, item.qty);
        }

    }

    putInternalOrders = async (id, newState, products) => {

        await this.internalOrderHandler.modifyStateByID(id, newState);
        if (newState == "COMPLETED") {
            for (let product of products) {
                await this.internalOrderHandler.addCompletedItem(id, product.SkuID, product.RFID)
            }
        }

    }
    deleteInternalOrders = async (id) => {
        await this.internalOrderHandler.deleteInternalOrderByID(id);
    }

}

module.exports = InternalOrderService;