"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStateEnum = exports.OrderState = void 0;
var OrderState;
(function (OrderState) {
    OrderState["PENDING"] = "pending";
    OrderState["SUCCESS"] = "success";
    OrderState["FAILED"] = "failed";
})(OrderState || (exports.OrderState = OrderState = {}));
exports.orderStateEnum = Object.values(OrderState);
