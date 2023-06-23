import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import { SET_PAGE_TITLE } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";

function CompanyEdit() {
  const { uuid } = useParams();

  useEffect(() => {
    SET_PAGE_TITLE("Edit Company");
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Edit Company">
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {uuid}
          </Grid>
        </Grid>
      </ArgonBox>
    </DashboardLayout>
  );
}
export default CompanyEdit;
