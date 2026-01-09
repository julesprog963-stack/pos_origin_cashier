/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";
import { SaveButton } from "@point_of_sale/app/screens/product_screen/control_buttons/save_button/save_button";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { useService } from "@web/core/utils/hooks";
import { Component, xml } from "@odoo/owl";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";
import { usePos } from "@point_of_sale/app/store/pos_hook";

// Mantiene el campo origin_cashier_id en las órdenes creadas desde el POS.
patch(Order.prototype, {
    setup() {
        super.setup(...arguments);
        this.origin_cashier_id =
            this.origin_cashier_id || this.pos.last_origin_cashier_id || null;
    },
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        this.origin_cashier_id = json.origin_cashier_id || null;
        if (this.origin_cashier_id) {
            this.pos.last_origin_cashier_id = this.origin_cashier_id;
        }
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

export class OriginCashierSelectorButton extends Component {
    static template = xml`
        <button class="control-button" t-on-click="onClick">
            <i class="fa fa-user" role="img" aria-label="Seller"/>
            <span t-esc="label"/>
        </button>
    `;

    setup() {
        this.popup = useService("popup");
        this.pos = usePos();
    }

    get label() {
        const order = this.pos.get_order();
        if (order?.origin_cashier_id) {
            const emp = this.pos.employee_by_id?.[order.origin_cashier_id];
            return emp ? emp.name : "SELLER";
        }
        if (
            this.pos.last_origin_cashier_id &&
            this.pos.employee_by_id?.[this.pos.last_origin_cashier_id]
        ) {
            return this.pos.employee_by_id[this.pos.last_origin_cashier_id].name;
        }
        return "SELLER";
    }

    async onClick() {
        if (!this.pos.config.module_pos_hr) {
            return;
        }
        const employees = this.pos.employees || [];
        const list = employees.map((emp) => ({
            id: emp.id,
            item: emp,
            label: emp.name,
            isSelected: emp.id === this.pos.get_order()?.origin_cashier_id,
        }));
        const { confirmed, payload } = await this.popup.add(SelectionPopup, {
            title: "Seleccionar vendedor",
            list,
        });
        if (!confirmed || !payload) {
            return;
        }
        const order = this.pos.get_order();
        if (!order) {
            return;
        }
        order.origin_cashier_id = payload.id;
        this.pos.last_origin_cashier_id = payload.id;
        this.render(true);
    }
}

ProductScreen.addControlButton({
    component: OriginCashierSelectorButton,
    condition() {
        return this.pos.config.module_pos_hr;
    },
});
