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
    icon: "fas fa-tags", // Changed from fa-list-alt to fa-tags
    component: ListCategories,
    id_role: "ADMIN", // ADMIN and COMMERCIAL
    componentStr: "ListCategories",
  },
  {
    path: "/categories/add",
    name: "Add Category",
    icon: "fas fa-plus-square", // Changed from fa-plus to fa-plus-square
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
    icon: "fas fa-boxes", // Changed from fa-box to fa-boxes
    component: ListProducts,
    id_role: "ADMIN",
    componentStr: "ListProducts",
  },
  {
    path: "/products/add",
    name: "Add Product",
    icon: "fas fa-cart-plus", // Changed from fa-plus to fa-cart-plus
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
    icon: "fas fa-user-tie", // Changed from fa-users to fa-user-tie
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
    icon: "fas fa-truck-loading", // Changed from fa-truck to fa-truck-loading
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
];

export default dashboardRoutes;
