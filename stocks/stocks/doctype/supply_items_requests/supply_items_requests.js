// Copyright (c) 2024, Osama Shujaa Aldeen and contributors
// For license information, please see license.txt
frappe.provide("erpnext.stock");
erpnext.buying.setup_buying_controller();

frappe.ui.form.on("Supply Items Requests", {
	refresh(frm) {

	},
});
frappe.ui.form.on("Supply Items Requests", 'set_posting_date_and_time_read_only', function(frm) {
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

frappe.ui.form.on("Supply Items Requests", 'refresh', function(frm) {
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