var express = require("express");
const { UserAccountRoutes } = require("./user_account/user_account_routes");
const { DepartmentRoutes } = require("./department/department_routes");
const { RoleRoutes } = require("./role/role_routes");
const { ApproverRoutes } = require("./approver/approver_routes");
const { UserProfileRoutes } = require("./user_profile/user_profile_routes");
const { FlierRoutes } = require("./flier/flier_routes");
const { FlightRequestRoutes } = require("./flight_request/flight_request_route");
const { FormTypeRoutes } = require("./form_type/form_type_routes");
const { StatusTypeRoutes } = require("./status_type/status_type_routes");
const { PurposeOfTravelRoutes } = require("./purpose_of_travel/purpose_of_travel_routes");
const { BookingDetailsRoutes } = require("./booking_details/booking_details_routes");
const { UserCredentialsRoutes } = require("./user_credentials/user_credentials_routes");
const { RequestRoutes } = require("./request/request_routes");
const { NotificationRoutes } = require("./notification/notification_routes");
const { ProgressUpdateRoutes } = require("./progress_update/progress_update_route");

var router = express.Router();

router.use("/user", UserAccountRoutes);
router.use("/department", DepartmentRoutes);
router.use("/role", RoleRoutes);
router.use("/approver", ApproverRoutes);
router.use("/user_profile", UserProfileRoutes);
router.use("/flier", FlierRoutes);
router.use("/flight_request", FlightRequestRoutes);
router.use("/form_type", FormTypeRoutes)
router.use("/status_type", StatusTypeRoutes)
router.use("/purpose_of_travel", PurposeOfTravelRoutes);
router.use("/booking_details", BookingDetailsRoutes);
router.use("/user_credentials", UserCredentialsRoutes);
router.use("/request", RequestRoutes);
router.use("/notification", NotificationRoutes);
router.use("/progress_update", ProgressUpdateRoutes);

module.exports = router;