import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Card from "@mui/material/Card";

//  MUI components
import ArgonBox from "components/ArgonBox";
import ArgonButton from "components/ArgonButton";
import ProductInfo from "./components/ProductInfo";
import Media from "./components/Media";
import Socials from "./components/Socials";
import Pricing from "./components/Pricing";
import DashboardLayout from "layouts/DashboardLayout";

// Images
const bgImage =
  "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";

function getSteps() {
  return ["1. Product Info", "2. Media", "3. Social", "4. Pricing"];
}

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return <ProductInfo />;
    case 1:
      return <Media />;
    case 2:
      return <Socials />;
    case 3:
      return <Pricing />;
    default:
      return null;
  }
}

function NewProduct() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => setActiveStep(activeStep + 1);
  const handleBack = () => setActiveStep(activeStep - 1);

  return (
    <ArgonBox mt={1} mb={20} className="default-card">
      <Grid container justifyContent="center">
        <Grid item xs={12} lg={8}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Card sx={{ overflow: "visible" }}>
            <ArgonBox p={2}>
              <ArgonBox>
                {getStepContent(activeStep)}
                <ArgonBox mt={3} width="100%" display="flex" justifyContent="space-between">
                  {activeStep === 0 ? (
                    <ArgonBox />
                  ) : (
                    <ArgonButton variant="gradient" color="secondary" onClick={handleBack}>
                      Back
                    </ArgonButton>
                  )}
                  <ArgonButton
                    variant="gradient"
                    color="dark"
                    onClick={!isLastStep ? handleNext : undefined}
                  >
                    {isLastStep ? "Send" : "Next"}
                  </ArgonButton>
                </ArgonBox>
              </ArgonBox>
            </ArgonBox>
          </Card>
        </Grid>
      </Grid>
    </ArgonBox>
  );
}

export default NewProduct;
