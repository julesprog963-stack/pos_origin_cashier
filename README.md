# pos_origin_cashier

Persistencia del cajero/empleado origen (PIN) en ordenes de POS enviadas a caja. Se fija cuando se pulsa el boton Enviar (SaveButton/SendButton) y no se sobrescribe aunque otro cajero cobre la orden.

## Instalacion
- Copiar el modulo en `custom_addons` (montado en `/mnt/extra-addons`).
- Actualizar la lista de aplicaciones y buscar **POS Origin Cashier**.
- Instalar; depende de `point_of_sale` y `pos_hr`.

## Upgrade
- Via Apps: **Actualizar** el modulo.
- Via CLI dentro del contenedor Odoo: `./odoo-bin -c /etc/odoo/odoo.conf -d <db> -u pos_origin_cashier`

## Uso y validacion rapida
1. Abrir el POS con `pos_hr` activo (log in por PIN).
2. Crear una orden, pulsa **Enviar** (usa el boton existente). La orden queda en borrador en el backend.
3. En backend (`POS > Ordenes`) verificar que `Origen Cashier` muestra el empleado activo al momento de enviar.
4. Cobrar la orden con otro cajero y validar que el campo no cambia.
5. En `POS > Reportes > Analisis de ordenes`, usar el Group By **Cashier origen** para metricas.

## Alcance
- Sin pantallas ni botones nuevos: reutiliza el flujo nativo de Enviar/Guardar.
- No modifica la logica de devoluciones; el origen se fija al momento de enviar la venta.
