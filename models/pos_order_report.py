# -*- coding: utf-8 -*-
from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    origin_cashier_id = fields.Many2one(
        "hr.employee", string="Origin Cashier", readonly=True
    )

    def _select(self):
        return super()._select() + ", s.origin_cashier_id AS origin_cashier_id"

    def _group_by(self):
        return super()._group_by() + ", s.origin_cashier_id"
