import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Backdrop, CircularProgress, Typography } from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";
import moment from "moment/moment";
import { GET_ROUTE_NAME, SET_PAGE_TITLE } from "helpers/Base";
import { GET_QUERY } from "helpers/Base";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import ArgonTypography from "components/ArgonTypography";
import { DashboardLayout } from "layouts";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";
import { FORMATE_DATE } from "helpers/Base";

function UserView() {
  const userUuid = GET_QUERY("uuid");
  const [user, setUser] = useState({});
  const [backdropOpen, setBackdropOpen] = useState(false);

  const getUser = async () => {
    await HTTP_CLIENT(APIFY("/v1/users/view"), {
      uuid: userUuid,
    }).then(({ user }) => {
      SET_PAGE_TITLE(`${user["full_name"]} - Users - Informermics`);
      setUser(user);
    });
  };
  const convertToLower = (value) => {
    if (value) {
      return value[0] + value.slice(1).toLowerCase();
    } else {
      return false;
    }
  };

  useEffect(() => {
    let ajaxEvent = true;
    if (ajaxEvent) {
      getUser();
    }
    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage User">
      <CardWrapper
        headerTitle={"User Details"}
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/users/view"]}
              route={GET_ROUTE_NAME("LIST_USER")}
              text={`Back to Users`}
              icon={<ArrowBackRounded />}
            />
          );
        }}
      >
        {!backdropOpen && user && (
          <Grid container display="flex" sx={{ border: "1px solid #c2c2c2" }}>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Full Name
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user["full_name"]}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Employment Type
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.user_attribute?.employment_status}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Status
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user["is_active"] ? <>Active</> : <>Inactive</>}
              </Typography>
            </Grid>

            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Gender
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {convertToLower(user?.user_attribute?.gender)}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Date of Birth
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {FORMATE_DATE(user?.user_attribute?.date_of_birth)}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Age
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {moment(user?.user_attribute?.date_of_birth, "YYYYMMDD").fromNow(true)}
              </Typography>
            </Grid>

            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Email
              </Typography>

              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user["email"]}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Contact Number
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.user_attribute?.contact_number}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Office Number
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.user_attribute?.office_contact_number}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Address
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.user_attribute?.address}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Office Address
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.user_attribute?.office_address}
              </Typography>
            </Grid>

            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Location
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.user_attribute?.location}
              </Typography>
            </Grid>

            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Department
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.departments && user?.departments.length > 0 && user?.departments[0].name}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Designation
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.user_attribute?.designation}
              </Typography>
            </Grid>

            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Date of Joining
              </Typography>

              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {FORMATE_DATE(user?.user_attribute?.date_of_joining)}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Infomerics Experience
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {moment(user?.user_attribute?.date_of_joining, "YYYYMMDD").fromNow(true)}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{
                borderBottom: "1px solid #c2c2c2",
                borderRight: "1px solid #c2c2c2",
                display: "flex",
              }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Roles
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user &&
                  user?.roles &&
                  user.roles.map((role, key) => {
                    return (
                      <ArgonTypography variant="span" fontSize={"15px"} key={key}>
                        {(user.roles.length-2 >= key) ? role.name +", " : role.name}
                      </ArgonTypography>
                    );
                  })}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ borderBottom: "1px solid #c2c2c2", display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Termination Date
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {FORMATE_DATE(user?.user_attribute?.date_of_termination)}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ display: "flex", borderRight: "1px solid #c2c2c2" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                First Reporting Person
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {user?.report_to_user &&
                  user?.report_to_user.length > 0 &&
                  user?.report_to_user[0].full_name}
              </Typography>
            </Grid>

            <Grid
              item
              xs={6}
              paddingTop="10px"
              paddingBottom="10px"
              paddingLeft="1.5rem"
              alignItems={"center"}
              sx={{ display: "flex" }}
            >
              <Typography variant="p" sx={{ width: "30%", display: "block", fontWeight: 600 }}>
                Last Login
              </Typography>
              <Typography variant="p" sx={{ width: "5%" }}>
                :
              </Typography>
              <Typography variant="p" sx={{ width: "65%", display: "block" }}>
                {FORMATE_DATE(user?.updated_at)}
              </Typography>
            </Grid>
          </Grid>
        )}
      </CardWrapper>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </DashboardLayout>
  );
}
export default UserView;
