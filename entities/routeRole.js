module.exports = (routeRole) => {

  let newRouteRole = { 
    routeId: routeRole.routeId,
    roleId: routeRole.roleId,
    isActive: routeRole.isActive,
    createdAt: routeRole.createdAt,
    updatedAt: routeRole.updatedAt,
    addedBy: routeRole.addedBy,
    updatedBy: routeRole.updatedBy,
    isDeleted: routeRole.isDeleted,
  };

  // remove undefined values
  Object.keys(newRouteRole).forEach(key => newRouteRole[key] === undefined && delete newRouteRole[key]);

  // To validate Entity uncomment this block
  /*
   * const validate = (newRouteRole) => {
   *   if (!newRouteRole.field) {
   *       throw new Error("this field is required");
   *   }
   * }
   * validate(newRouteRole) 
   */

  return Object.freeze(newRouteRole);
};
