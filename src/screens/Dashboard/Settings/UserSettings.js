import { useEffect } from "react";
import { Grid } from "@mui/material";
import { SET_PAGE_TITLE } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";
import FullWidthCard from "slots/Cards/FullWidthCard";

function UserSettings() {
  useEffect(() => {
    SET_PAGE_TITLE("Manage User Settings");
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage User Settings">
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FullWidthCard
              title="User Settings"
              text="Manage your settings."
            />
          </Grid>
        </Grid>
      </ArgonBox>
    </DashboardLayout>
  );
}
export default UserSettings;
