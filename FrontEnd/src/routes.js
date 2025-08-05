import AjouterRole from "./views/Settings/Role/AjouterRole";
import ListRole from "./views/Settings/Role/ListRole";
import AjouterUser from "./views/Settings/User/AjouterUser";
import ListUser from "./views/Settings/User/ListUser";
const dashboardRoutes = [
  // User
  {
    path: "/user/add",
    name: "User add",
    icon: "fas fa-user-plus", // Ajout d'utilisateur
    component: AjouterUser,
    componentStr: "AjouterUser",
    id_role: "1",
    className: "hidden",
  },
  {
    path: "/user/update/:id",
    name: "User update",
    icon: "fas fa-user-edit", // Modification d'utilisateur
    component: AjouterUser,
    componentStr: "AjouterUser",
    id_role: "1",
    className: "hidden",
  },
  {
    path: "/user/list",
    name: "Users",
    icon: "fas fa-users", // Liste des utilisateurs
    component: ListUser,
    id_role: "1",
    componentStr: "ListUser",
  },

  // Role
  {
    path: "/role/list",
    name: "Roles",
    icon: "fas fa-user-shield", // Liste des rôles
    component: ListRole,
    id_role: "1",
    componentStr: "ListRole",
    className: "hidden",
  },
  {
    path: "/role/add",
    name: "Role add",
    icon: "fas fa-user-plus", // Ajout de rôle
    component: AjouterRole,
    componentStr: "AjouterRole",
    id_role: "1",
    className: "hidden",
  },
  {
    path: "/role/update/:id",
    name: "Role update",
    icon: "fas fa-user-edit", // Modification de rôle
    component: AjouterRole,
    componentStr: "AjouterRole",
    id_role: "1",
    className: "hidden",
  },
];

export default dashboardRoutes;
