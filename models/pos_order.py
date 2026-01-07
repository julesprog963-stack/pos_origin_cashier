# -*- coding: utf-8 -*-
from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    origin_cashier_id = fields.Many2one(
        "hr.employee",
        string="Origin Cashier",
        help="Empleado que origino la orden en POS (PIN). Se asigna al enviar a caja y no cambia.",
        index=True,
        readonly=True,
    )

    @classmethod
    def _origin_cashier_val(cls, ui_order):
        """Safely extract the origin cashier id from the ui payload."""
        return ui_order.get("origin_cashier_id") or False

    @classmethod
    def _filter_originable(cls, records, origin_id):
        """Return records allowed to set/update origin_cashier_id."""
        return records.filtered(
            lambda order: not order.origin_cashier_id
            or order.origin_cashier_id.id == origin_id
        )

    def write(self, vals):
        """Block overrides of origin_cashier_id once set to a different value."""
        if "origin_cashier_id" in vals:
            origin_id = vals.get("origin_cashier_id") or False
            eligible_orders = self._filter_originable(self, origin_id)
            locked_orders = self - eligible_orders

            results = []
            if eligible_orders:
                results.append(super(PosOrder, eligible_orders).write(vals))
            if locked_orders:
                remaining_vals = {k: v for k, v in vals.items() if k != "origin_cashier_id"}
                if remaining_vals:
                    results.append(super(PosOrder, locked_orders).write(remaining_vals))
            return all(results) if results else True

        return super().write(vals)

    @classmethod
    def _extend_order_payload(cls, values, ui_order):
        origin_id = cls._origin_cashier_val(ui_order)
        if origin_id:
            values["origin_cashier_id"] = origin_id
        return values

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super()._order_fields(ui_order)
        return self._extend_order_payload(order_fields, ui_order)

    def _export_for_ui(self, order):
        result = super()._export_for_ui(order)
        result.update({"origin_cashier_id": order.origin_cashier_id.id})
        return result
