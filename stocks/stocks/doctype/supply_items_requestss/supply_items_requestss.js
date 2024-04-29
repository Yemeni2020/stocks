// Copyright (c) 2024, Osama Shujaa Aldeen and contributors
// For license information, please see license.txt
frappe.provide("erpnext.stock");
frappe.ui.form.on("Supply Items Requestss", {
	refresh(frm) {

	},
    onload() {
		// warehouse query if company
		if (this.frm.fields_dict.company) {
			this.setup_warehouse_query();
		}
	},
    barcode(frm, cdt, cdn)  {
		let row = locals[cdt][cdn];
		if (row.barcode) {
			erpnext.stock.utils.set_item_details_using_barcode(this.frm, row, (r) => {
				frappe.model.set_value(cdt, cdn, {
					"item_code": r.message.item_code,
					"qty": 1,
				});
			});
		}
	},
    calculate_total: function (frm) {
		let total = 0,
			base_total = 0;
		frm.doc.items.forEach((item) => {
			total += item.amount;
			base_total += item.base_amount;
		});

		frm.set_value({
			total: flt(total),
			base_total: flt(base_total),
		});
	},
    
});
frappe.ui.form.on("Supply Items Requestss", {
	calculate: function (frm, cdt, cdn) {
		let row = frappe.get_doc(cdt, cdn);
		frappe.model.set_value(cdt, cdn, "amount", flt(row.qty) * flt(row.rate));
		frappe.model.set_value(cdt, cdn, "base_rate", flt(frm.doc.conversion_rate) * flt(row.rate));
		frappe.model.set_value(cdt, cdn, "base_amount", flt(frm.doc.conversion_rate) * flt(row.amount));
		frm.trigger("calculate_total");
	},
	qty: function (frm, cdt, cdn) {
		frm.trigger("calculate", cdt, cdn);
	},
	rate: function (frm, cdt, cdn) {
		frm.trigger("calculate", cdt, cdn);
	},
});
frappe.ui.form.on("Supply Items Requestss", 'set_posting_date_and_time_read_only', function(frm) {
    if(frm.doc.docstatus == 0 && frm.doc.set_posting_time) {
        frm.set_df_property('posting_date', 'read_only', 0);
        frm.set_df_property('posting_time', 'read_only', 0);
    } else {
        frm.set_df_property('posting_date', 'read_only', 1);
        frm.set_df_property('posting_time', 'read_only', 1);
    }
})

frappe.ui.form.on("Supply Items Requestss", 'set_posting_time', function(frm) {
    frm.trigger('set_posting_date_and_time_read_only');
});

frappe.ui.form.on("Supply Items Requestss", 'refresh', function(frm) {
    // set default posting date / time
    if(frm.doc.docstatus==0) {
        if(!frm.doc.posting_date) {
            frm.set_value('posting_date', frappe.datetime.nowdate());
        }
        if(!frm.doc.posting_time) {
            frm.set_value('posting_time', frappe.datetime.now_time());
        }
        frm.trigger('set_posting_date_and_time_read_only');
    }
});
