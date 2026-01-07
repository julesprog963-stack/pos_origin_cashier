{
    "name": "POS Origin Cashier",
    "summary": "Guarda el cajero/empleado que envio la orden al cajero y lo muestra en vistas y reportes.",
    "description": "Persistencia del cajero origen en ordenes de POS enviadas a caja para metricas y trazabilidad.",
    "version": "17.0.1.0.0",
    "category": "Point of Sale",
    "author": "JDA SOLUTIONS",
    "website": "https://github.com/julesprog963-stack/pos_origin_cashier",
    "license": "LGPL-3",
    "depends": ["point_of_sale", "pos_hr"],
    "data": [
        "security/ir.model.access.csv",
        "views/pos_order_views.xml",
        "views/pos_order_report_search.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_origin_cashier/static/src/js/origin_cashier.js",
        ],
    },
    "images": [
        "static/description/icon.png",
    ],
}
