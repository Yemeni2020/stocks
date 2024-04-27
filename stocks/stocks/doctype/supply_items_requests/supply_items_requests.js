// Copyright (c) 2024, Osama Shujaa Aldeen and contributors
// For license information, please see license.txt
frappe.provide("erpnext.stock");
erpnext.buying.setup_buying_controller();

frappe.ui.form.on("Supply Items Requests", {
	refresh(frm) {
        frm.add_custom_button("Click Me")
	},
	setup: (frm) => {
		frm.make_methods = {
			"Landed Cost Voucher": () => {
				let lcv = frappe.model.get_new_doc("Landed Cost Voucher");
				lcv.company = frm.doc.company;

				let lcv_receipt = frappe.model.get_new_doc("Landed Cost Purchase Receipt");
				lcv_receipt.receipt_document_type = "Purchase Receipt";
				lcv_receipt.receipt_document = frm.doc.name;
				lcv_receipt.supplier = frm.doc.supplier;
				lcv_receipt.grand_total = frm.doc.grand_total;
				lcv.purchase_receipts = [lcv_receipt];

				frappe.set_route("Form", lcv.doctype, lcv.name);
			},
		};

		frm.custom_make_buttons = {
			"Stock Entry": "Return",
			"Purchase Invoice": "Purchase Invoice",
		};

		frm.set_query("expense_account", "items", function () {
			return {
				query: "erpnext.controllers.queries.get_expense_account",
				filters: { company: frm.doc.company },
			};
		});

		

	
		
	},
});
erpnext.stock.PurchaseReceiptController = class PurchaseReceiptController extends (
	erpnext.buying.BuyingController
) {
	setup(doc) {
		this.setup_posting_date_time_check();
		super.setup(doc);
	}

	refresh() {
		var me = this;
		super.refresh();

		erpnext.accounts.ledger_preview.show_accounting_ledger_preview(this.frm);
		erpnext.accounts.ledger_preview.show_stock_ledger_preview(this.frm);

		if (this.frm.doc.docstatus > 0) {
			this.show_stock_ledger();
			//removed for temporary
			this.show_general_ledger();

			this.frm.add_custom_button(
				__("Asset"),
				function () {
					frappe.route_options = {
						purchase_receipt: me.frm.doc.name,
					};
					frappe.set_route("List", "Asset");
				},
				__("View")
			);

			this.frm.add_custom_button(
				__("Asset Movement"),
				function () {
					frappe.route_options = {
						reference_name: me.frm.doc.name,
					};
					frappe.set_route("List", "Asset Movement");
				},
				__("View")
			);
		}

		
		
	}


	make_purchase_return() {
		let me = this;

		let has_rejected_items = cur_frm.doc.items.filter((item) => {
			if (item.rejected_qty > 0) {
				return true;
			}
		});

		if (has_rejected_items && has_rejected_items.length > 0) {
			frappe.prompt(
				[
					{
						label: __("Return Qty from Rejected Warehouse"),
						fieldtype: "Check",
						fieldname: "return_for_rejected_warehouse",
						default: 1,
					},
				],
				
				__("Return Qty"),
				__("Make Return Entry")
			);
		} else {
			cur_frm.cscript._make_purchase_return();
		}
	}

	close_purchase_receipt() {
		cur_frm.cscript.update_status("Closed");
	}

	reopen_purchase_receipt() {
		cur_frm.cscript.update_status("Submitted");
	}

	

	apply_putaway_rule() {
		if (this.frm.doc.apply_putaway_rule) erpnext.apply_putaway_rule(this.frm);
	}
};
// for backward compatibility: combine new and previous states
extend_cscript(cur_frm.cscript, new erpnext.stock.PurchaseReceiptController({ frm: cur_frm }));





cur_frm.fields_dict["select_print_heading"].get_query = function (doc, cdt, cdn) {
	return {
		filters: [["Print Heading", "docstatus", "!=", "2"]],
	};
};

cur_frm.fields_dict["items"].grid.get_field("bom").get_query = function (doc, cdt, cdn) {
	var d = locals[cdt][cdn];
	return {
		filters: [
			["BOM", "item", "=", d.item_code],
			["BOM", "is_active", "=", "1"],
			["BOM", "docstatus", "=", "1"],
		],
	};
};
frappe.provide("erpnext.buying");

frappe.ui.form.on("Purchase Receipt Item", {
	item_code: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn];
		frappe.db.get_value("Item", { name: d.item_code }, "sample_quantity", (r) => {
			frappe.model.set_value(cdt, cdn, "sample_quantity", r.sample_quantity);
			validate_sample_quantity(frm, cdt, cdn);
		});
	},
	qty: function (frm, cdt, cdn) {
		validate_sample_quantity(frm, cdt, cdn);
	},
	sample_quantity: function (frm, cdt, cdn) {
		validate_sample_quantity(frm, cdt, cdn);
	},
	batch_no: function (frm, cdt, cdn) {
		validate_sample_quantity(frm, cdt, cdn);
	},
});
