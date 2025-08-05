/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
import { useLocation, Link } from "react-router-dom";

import { Nav ,Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

function Sidebar({ routes, background,users }) {
  const settings = useSelector(state => state.settings.entities);
  const [state, setState] = React.useState({});
  var idrole = users.user.id_role;
  const location = useLocation();
  const getCollapseInitialState = (routes) => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (location.pathname === routes[i].layout + routes[i].path) {
        return true;
      }
    }
    return false;
  };
  const activeRoute = (routeName) => {
    return location.pathname === routeName ? "active" : "";
  };
  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      var st = {};
      if ((prop.role.includes(idrole)) || prop.role.includes(20)) {
        if (prop.redirect) {
          return null;
        }
        if (prop.collapse) {
          st[prop["state"]] = !state[prop.state];
          return (
            <Nav.Item
              className={getCollapseInitialState(prop.views) ? "active" : ""}
              as="li"
              key={key}
            >
              <Nav.Link
                className={state[prop.state] ? "collapsed" : ""}
                data-toggle="collapse"
                onClick={(e) => {
                  e.preventDefault();
                  setState({ ...state, ...st });
                }}
                aria-expanded={state[prop.state]}
              >
                <i className={prop.icon}></i>
                <p>
                  {prop.name} <b className="caret"></b>
                </p>
              </Nav.Link>
              <Collapse in={state[prop.state]}>
                <div>
                  <Nav as="ul">{createLinks(prop.views)}</Nav>
                </div>
              </Collapse>
            </Nav.Item>
          );
        }
        return (
          <Nav.Item className={activeRoute(prop.path)} key={key} as="li">
            {/* {getTitle(prop.path, prop.name)} */}
            <Nav.Link className={prop.className} to={prop.path} as={Link}>
              {prop.icon ? (
                <>
                  <i className={prop.icon} />
                  <p>{prop.name}</p>
                </>
              ) : (
                <>
                  <span className="sidebar-mini">{prop.mini}</span>
                  <span className="sidebar-normal">{prop.name}</span>
                </>
              )}
            </Nav.Link>
          </Nav.Item>
        );
      } else {      
        return null;
      }
    });
  };
  return (
    <div className="sidebar">
      <div
        className="sidebar-background"
      />
      <div className="sidebar-wrapper">
        <div className="logo d-flex align-items-center justify-content-start">
          <a>
            <div className="logo-img">
            {settings.length > 0 ?<img src={require("assets/img/" + settings[0].logo)} alt="..." />:""}
            </div>
          </a>
        </div>
        <Nav>{createLinks(routes)}</Nav>
          {/* {routes.map((prop, key) => {
            if (!prop.redirect)
              return (
                <li
                  className={
                    prop.upgrade
                      ? "active active-pro"
                      : activeRoute(prop.layout + prop.path)
                  }
                  key={key}
                >
                  <NavLink
                    to={prop.path}
                    className="nav-link"
                    activeClassName="active"
                  >
                    <i className={prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            return null;
          })} */}
        
      </div>
    </div>
  );
}

export default Sidebar;
