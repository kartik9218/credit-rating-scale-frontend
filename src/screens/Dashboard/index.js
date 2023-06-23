import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Backdrop, Box, CircularProgress, Grid } from "@mui/material";
import { Star, CreditCard, CheckCircle, PendingActions } from "@mui/icons-material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";
import DetailedStatisticsCard from "slots/Cards/StatisticsCards/DetailedStatisticsCard";
import TodoList from "slots/Examples/TodoList";
import VerticalBarChart from "slots/Charts/BarCharts/VerticalBarChart";
import { GET_USER_PROPS } from "helpers/Base";
import CardWrapper from "slots/Cards/CardWrapper";
import { ArgonTypography } from "components/ArgonTheme";
import logo from "assets/images/logo.png";
import minilogo from "assets/images/minilogo.png";

function Dashboard() {
  const { uuid } = useParams();
  const [company, setCompany] = useState(undefined);

  useEffect(() => {
    SET_PAGE_TITLE("Dashboard");

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchData();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  const fetchData = () => {
    let companyId = "";
    let companies = [] ?? GET_USER_PROPS("companies");
    companies.forEach((row) => {
      if (row["uuid"] === uuid) {
        companyId = row["id"];
        return;
      }
    });

    HTTP_CLIENT(APIFY("/v1/dashboard"), { company_id: companyId }).then((data) => {
      setCompany(data);
    });
  };

  const getCardIcon = (name) => {
    switch (name) {
      case "No. of Provisional Rating":
        return { color: "error", component: <Star fontSize="medium" /> };

      case "No. of Credit Watch":
        return { color: "info", component: <CreditCard fontSize="medium" /> };

      case "Initial Serveillance":
        return { color: "success", component: <CheckCircle fontSize="medium" /> };

      case "No. of Cases Left":
        return { color: "warning", component: <PendingActions fontSize="medium" /> };

      default:
        break;
    }
  };

  return (
    <DashboardLayout breadcrumbTitle="Dashboard" showCompany={true}>
      <CardWrapper>
        <Box sx={{ display: "grid", placeItems: "center", height: "calc(100vh - 33vh)" }}>
          <Box>
            <ArgonTypography
              textAlign={"center"}
              fontSize={"30px"}
              sx={{
                color: "#a7a7a7",
              }}
            >
              Welcome to
            </ArgonTypography>
            <Box textAlign={"center"}>
              <img
                src={logo}
                style={{
                  height: "80px",
                }}
                alt={"app-logo"}
              />
            </Box>
            <ArgonTypography
              fontSize={"24px"}
              textAlign={"center"}
              sx={{
                color: "#a7a7a7",
              }}
            >
              Navigate screens through left side bar.
            </ArgonTypography>
          </Box>
        </Box>
        {false && company && (
          <ArgonBox sx={{ height: "calc(100vh - 22.5vh)", overflowY: "scroll", padding: "10px", marginTop: "-30px" }}>
            <Grid container spacing={2} mb={3}>
              {company["cards"].map((card) => {
                return (
                  <Grid item xs={12} md={6} lg={3} key={card["id"]}>
                    <DetailedStatisticsCard title={card["name"]} count={card["count"]} icon={getCardIcon(card["name"])} />
                  </Grid>
                );
              })}
            </Grid>

            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} lg={7}>
                <TodoList rows={company["activities"]} />
              </Grid>

              <Grid item xs={12} lg={5}>
                <Grid item xs={12} mb={3}>
                  <VerticalBarChart
                    title="Rating Dispersion"
                    chart={{
                      labels: ["16-20", "21-25", "26-30", "31-36", "36-42", "42+"],
                      datasets: [
                        {
                          label: "Sales by age",
                          backgroundColor: "#3D8DA7",
                          data: [15, 20, 12, 60, 20, 15],
                        },
                      ],
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <VerticalBarChart
                    title="Portfolio Summary"
                    chart={{
                      labels: ["16-20", "21-25", "26-30", "31-36", "36-42", "42+"],
                      datasets: [
                        {
                          label: "Sales by age",
                          backgroundColor: "#7D8DA3",
                          data: [5, 7, 12, 7, 11, 15],
                        },
                      ],
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </ArgonBox>
        )}
        {false && !company && (
          <div>
            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={!company}>
              <CircularProgress color="inherit" />
            </Backdrop>
          </div>
        )}
      </CardWrapper>
    </DashboardLayout>
  );
}
export default Dashboard;
