class ReturnOrderService {

    constructor(returnOrderHandler,restockOrderHandler) {
        this.returnOrderHandler = returnOrderHandler;
        this.restockOrderHandler = restockOrderHandler;
    }


    getReturnOrders = async () => {
        let returnOrders = await this.returnOrderHandler.getAllOrders();

        let items = [];
        let rorder = [];
        let products = [];

        for (let order of returnOrders) {
            products = [];
            items = await this.returnOrderHandler.getProductsByID(order.REOID);
            for (let item of items) {
                products.push({ "SKUId": item.SKUID, "itemId": item.ITEMID, "description": item.DESCRIPTION, "price": item.PRICE, "RFID": item.RFID }) //added item id
            }
            rorder.push({
                "id": order.REOID,
                "returnDate": order.RETURNDATE,
                "state": order.Issue,
                "products": products,
                "restockOrderId": order.ROID,
            })
        }
        return rorder;
    }

    getReturnOrderById = async (id) => {
        let returnO = await this.returnOrderHandler.getOrderByID(id);
        let items = [];
        let rorder = [];
        let products = [];
        if(returnO===undefined) return []
        items = await this.returnOrderHandler.getProductsByID(id);
        console.log(items)
        for (let item of items) {
            products.push({ "SKUId": item.SKUID, "itemId": item.ITEMID,"description": item.DESCRIPTION, "price": item.PRICE, "RFID": item.RFID }) //added item id
        }
        if(items.length==1) products = products[0]; 
        rorder = {
            "returnDate": returnO.RETURNDATE,
            "products": products,
            "restockOrderId": returnO.ROID,
        }
        return rorder;
    }

    postReturnOrder = async (returnDate, products, restockOrderId) => {
        let OrderId = undefined;
        let present = await this.restockOrderHandler.getOrderByID(restockOrderId)
        if(present === undefined) return undefined;

        OrderId = await this.returnOrderHandler.addReturnOrder(restockOrderId, returnDate.format('YYYY-MM-DD HH:mm'))
        for (let item of products) {
            this.returnOrderHandler.addReturnItem(OrderId.id, item.RFID, item.itemId); //added item id
        }
        return OrderId;
    }

    deleteReturnOrder = async (id) => {
        await this.returnOrderHandler.deleteOrderByID(id)
    }

}
module.exports = ReturnOrderService;