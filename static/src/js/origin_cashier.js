/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";
import { SaveButton } from "@point_of_sale/app/screens/product_screen/control_buttons/save_button/save_button";

// Mantiene el campo origin_cashier_id en las órdenes creadas desde el POS.
patch(Order.prototype, {
    setup() {
        super.setup(...arguments);
        this.origin_cashier_id = this.origin_cashier_id || null;
    },
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        this.origin_cashier_id = json.origin_cashier_id || null;
    },
    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        json.origin_cashier_id = this.origin_cashier_id || null;
        return json;
    },
    setOriginCashier(employee) {
        if (!this.origin_cashier_id && employee?.id) {
            this.origin_cashier_id = employee.id;
        }
    },
});

// Antes de guardar/enviar, fija el cajero actual como origen si no existe.
patch(SaveButton.prototype, {
    async onClick() {
        const order = this.pos?.get_order();
        if (this.pos?.config?.module_pos_hr && order && !order.origin_cashier_id) {
            const cashier = this.pos.get_cashier();
            if (cashier?.id) {
                order.setOriginCashier(cashier);
            }
        }
        return await super.onClick(...arguments);
    },
});
