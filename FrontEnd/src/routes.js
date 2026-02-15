// src/routes/dashboardRoutes.js
import AjouterRole from "./views/Settings/Role/AjouterRole";
import ListRole from "./views/Settings/Role/ListRole";
import AjouterUser from "./views/Settings/User/AjouterUser";
import ListUser from "./views/Settings/User/ListUser";

// Import new components
import AjouterCategory from "./views/Settings/Category/AjouterCategory";
import ListCategories from "./views/Settings/Category/ListCategories";
import AjouterProduct from "./views/Settings/Product/AjouterProduct";
import ListProducts from "./views/Settings/Product/ListProducts";
import AjouterClient from "./views/Settings/Client/AjouterClient";
import ListClients from "./views/Settings/Client/ListClients";
import AjouterSupplier from "./views/Settings/Supplier/AjouterSupplier";
import ListSuppliers from "./views/Settings/Supplier/ListSuppliers";

// Import Purchase Invoice components
import ListPurchaseInvoice from "./views/Settings/Invoice/FactureList";
import AddPurchaseInvoice from "./views/Settings/Invoice/AddFacture";
import AddSaleInvoice from "./views/Settings/SaleInvoice/AddSaleInvoice";
import ListSaleInvoice from "./views/Settings/SaleInvoice/ListSaleInvoice";

// Import Payment components
import AjouterPayment from "./views/Settings/Payments/AjouterPayment";
import ListPayments from "./views/Settings/Payments/ListPayments";
import SaleInvoiceDetails from "./views/Settings/SaleInvoice/DetailFacture";
import CompanySettings from "./views/CompanySettings";
import ListRefundInvoice from "./views/Settings/SaleInvoiceRefund/ListRefundInvoice";
import AddRefundInvoice from "./views/Settings/SaleInvoiceRefund/AddRefundInvoice";

const dashboardRoutes = [
  // ==================== USER ====================
  {
    path: "/user/add",
    name: "User add",
    icon: "fas fa-user-plus",
    component: AjouterUser,
    componentStr: "AjouterUser",
    id_role: "ADMIN", // ADMIN only
    className: "hidden",
  },
  {
    path: "/user/update/:id",
    name: "User update",
    icon: "fas fa-user-edit",
    component: AjouterUser,
    componentStr: "AjouterUser",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/user/list",
    name: "Users",
    icon: "fas fa-users",
    component: ListUser,
    id_role: "ADMIN",
    componentStr: "ListUser",
  },

  // ==================== ROLE ====================
  {
    path: "/role/list",
    name: "Roles",
    icon: "fas fa-user-shield",
    component: ListRole,
    id_role: "ADMIN",
    componentStr: "ListRole",
    className: "hidden",
  },
  {
    path: "/role/add",
    name: "Role add",
    icon: "fas fa-user-plus",
    component: AjouterRole,
    componentStr: "AjouterRole",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/role/update/:id",
    name: "Role update",
    icon: "fas fa-user-edit",
    component: AjouterRole,
    componentStr: "AjouterRole",
    id_role: "ADMIN",
    className: "hidden",
  },

  // ==================== CATEGORIES ====================
  {
    path: "/categories/list",
    name: "Categories",
    icon: "fas fa-tags",
    component: ListCategories,
    id_role: "ADMIN",
    componentStr: "ListCategories",
  },
  {
    path: "/categories/add",
    name: "Add Category",
    icon: "fas fa-plus-square",
    component: AjouterCategory,
    componentStr: "AjouterCategory",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/categories/update/:id",
    name: "Update Category",
    icon: "fas fa-edit",
    component: AjouterCategory,
    componentStr: "AjouterCategory",
    id_role: "ADMIN",
    className: "hidden",
  },

  // ==================== PRODUCTS ====================
  {
    path: "/products/list",
    name: "Products",
    icon: "fas fa-boxes",
    component: ListProducts,
    id_role: "ADMIN",
    componentStr: "ListProducts",
  },
  {
    path: "/products/add",
    name: "Add Product",
    icon: "fas fa-cart-plus",
    component: AjouterProduct,
    componentStr: "AjouterProduct",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/products/update/:id",
    name: "Update Product",
    icon: "fas fa-edit",
    component: AjouterProduct,
    componentStr: "AjouterProduct",
    id_role: "ADMIN",
    className: "hidden",
  },

  // ==================== CLIENTS ====================
  {
    path: "/clients/list",
    name: "Clients",
    icon: "fas fa-user-tie",
    component: ListClients,
    id_role: "ADMIN",
    componentStr: "ListClients",
  },
  {
    path: "/clients/add",
    name: "Add Client",
    icon: "fas fa-user-plus",
    component: AjouterClient,
    componentStr: "AjouterClient",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/clients/update/:id",
    name: "Update Client",
    icon: "fas fa-user-edit",
    component: AjouterClient,
    componentStr: "AjouterClient",
    id_role: "ADMIN",
    className: "hidden",
  },

  // ==================== SUPPLIERS ====================
  {
    path: "/suppliers/list",
    name: "Suppliers",
    icon: "fas fa-truck-loading",
    component: ListSuppliers,
    id_role: "ADMIN",
    componentStr: "ListSuppliers",
  },
  {
    path: "/suppliers/add",
    name: "Add Supplier",
    icon: "fas fa-plus",
    component: AjouterSupplier,
    componentStr: "AjouterSupplier",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/suppliers/update/:id",
    name: "Update Supplier",
    icon: "fas fa-edit",
    component: AjouterSupplier,
    componentStr: "AjouterSupplier",
    id_role: "ADMIN",
    className: "hidden",
  },

  // ==================== PURCHASE INVOICES ====================
  /* {
    collapse: true,
    path: "/tableauDebord",
    name: "Facture d'achat",
    state: "extractions",
    icon: "far fa-copy",
    id_role: "ADMIN",
    views: [
      {
        path: "/purchase-invoices/list",
        name: "Purchase Invoices",
        icon: "fas fa-file-invoice-dollar",
        component: ListPurchaseInvoice,
        id_role: "ADMIN",
        componentStr: "ListPurchaseInvoice",
      },
    ],
  }, */
  /* {
    path: "/purchase-invoices/list",
    name: "Purchase Invoices",
    icon: "fas fa-file-invoice-dollar",
    component: ListPurchaseInvoice,
    id_role: "ADMIN",
    componentStr: "ListPurchaseInvoice",
  }, */

  {
    collapse: true,
    path: "/purchase-invoices/list",
    name: "Factures d'achat",
    state: "purchase",
    icon: "fas fa-file-invoice-dollar",
    id_role: "ADMIN",
    views: [
      {
        path: "/purchase-invoices/list/PURCHASE_ORDER",
        name: "Bon de commande",
        icon: "fas fa-file-invoice-dollar",
        component: ListPurchaseInvoice,
        id_role: "ADMIN",
        componentStr: "ListPurchaseInvoice",
      },
      {
        path: "/purchase-invoices/list/PURCHASE_INVOICE",
        name: "Facture achat",
        icon: "fas fa-file-invoice-dollar",
        component: ListPurchaseInvoice,
        id_role: "ADMIN",
        componentStr: "ListPurchaseInvoice",
      },
    ],
  },
  {
    path: "/purchase-invoice/add",
    name: "Add Purchase Invoice",
    icon: "fas fa-plus-circle",
    component: AddPurchaseInvoice,
    componentStr: "AddPurchaseInvoice",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/purchase-invoice/update/:id",
    name: "Update Purchase Invoice",
    icon: "fas fa-edit",
    component: AddPurchaseInvoice,
    componentStr: "AddPurchaseInvoice",
    id_role: "ADMIN",
    className: "hidden",
  },

  // ==================== SALE INVOICES ====================
  {
    collapse: true,
    path: "/sale-invoices/list",
    name: "Factures de Vente",
    state: "sale",
    icon: "fas fa-file-invoice-dollar",
    id_role: "ADMIN",
    views: [
      {
        path: "/sale-invoices/list/QUOTATION",
        name: "Devis",
        icon: "fas fa-file-invoice",
        component: ListSaleInvoice,
        id_role: "ADMIN",
        componentStr: "ListSaleInvoice",
      },
      {
        path: "/sale-invoices/list/DELIVERY_NOTE",
        name: "Bon de livraison",
        icon: "fas fa-file-invoice",
        component: ListSaleInvoice,
        id_role: "ADMIN",
        componentStr: "ListSaleInvoice",
      },
      {
        path: "/sale-invoices/list/SALE_INVOICE",
        name: "Facture vente",
        icon: "fas fa-file-invoice",
        component: ListSaleInvoice,
        id_role: "ADMIN",
        componentStr: "ListSaleInvoice",
      },
    ],
  },
  {
    path: "/sale-invoice/detail/:id",
    name: "Nouvelle Facture de Vente",
    icon: "fas fa-plus-circle",
    component: SaleInvoiceDetails,
    componentStr: "SaleInvoiceDetails",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/sale-invoice/add",
    name: "Nouvelle Facture de Vente",
    icon: "fas fa-plus-circle",
    component: AddSaleInvoice,
    componentStr: "AddSaleInvoice",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/sale-invoice/update/:id",
    name: "Modifier Facture de Vente",
    icon: "fas fa-edit",
    component: AddSaleInvoice,
    componentStr: "AddSaleInvoice",
    id_role: "ADMIN",
    className: "hidden",
  },
  /* {
    path: "/sale-invoice/detail/:id",
    name: "Nouvelle Facture de Vente",
    icon: "fas fa-plus-circle",
    component: SaleInvoiceDetails,
    componentStr: "SaleInvoiceDetails",
    id_role: "ADMIN",
    className: "hidden",
  }, */
  /* {
    path: "/refund-invoices/list",
    name: "Factures avoir",
    icon: "fas fa-file-invoice",
    component: ListRefundInvoice,
    id_role: "ADMIN",
    componentStr: "ListRefundInvoice",
  }, */
  {
    path: "/refund-invoice/add",
    name: "Nouvelle Facture de Vente",
    icon: "fas fa-plus-circle",
    component: AddRefundInvoice,
    componentStr: "AddRefundInvoice",
    id_role: "ADMIN",
    className: "hidden",
  },
  {
    path: "/refund-invoice/update/:id",
    name: "Modifier Facture de Vente",
    icon: "fas fa-edit",
    component: AddRefundInvoice,
    componentStr: "AddRefundInvoice",
    id_role: "ADMIN",
    className: "hidden",
  },

  // ==================== PAYMENTS ====================
  {
    path: "/payments/list",
    name: "Paiements",
    icon: "fas fa-money-check-alt",
    component: ListPayments,
    id_role: ["ADMIN", "FINANCE"], // ADMIN and FINANCE roles can access
    componentStr: "ListPayments",
  },
  {
    path: "/payments/add",
    name: "Nouveau Paiement",
    icon: "fas fa-money-bill-wave",
    component: AjouterPayment,
    componentStr: "AjouterPayment",
    id_role: ["ADMIN", "FINANCE"],
    className: "hidden",
  },
  {
    path: "/payments/update/:id",
    name: "Modifier Paiement",
    icon: "fas fa-edit",
    component: AjouterPayment,
    componentStr: "AjouterPayment",
    id_role: ["ADMIN", "FINANCE"],
    className: "hidden",
  },

  // ==================== DASHBOARD/ANALYTICS ====================
  {
    path: "/dashboard/payments-summary",
    name: "Tableau de Bord Paiements",
    icon: "fas fa-chart-line",
    component: ListPayments, // You can create a dedicated DashboardPaymentSummary component
    id_role: ["ADMIN", "FINANCE", "MANAGER"],
    componentStr: "ListPayments",
    className: "hidden", // Or make it visible in the menu
  },

  // ==================== PAYMENT REPORTS ====================
  {
    path: "/reports/payments",
    name: "Rapports Paiements",
    icon: "fas fa-file-alt",
    component: ListPayments, // You can create a dedicated PaymentReports component
    id_role: ["ADMIN", "FINANCE", "MANAGER"],
    componentStr: "ListPayments",
    className: "hidden",
  },

  // ==================== DASHBOARD/ANALYTICS ====================
  {
    path: "/companySettings",
    name: "Company Settings",
    icon: "fas fa-chart-line",
    component: CompanySettings, // You can create a dedicated DashboardPaymentSummary component
    id_role: ["ADMIN", "FINANCE", "MANAGER"],
    componentStr: "CompanySettings",
  },
];

export default dashboardRoutes;
