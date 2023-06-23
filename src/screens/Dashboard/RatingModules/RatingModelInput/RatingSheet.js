import React from 'react'
import { Card, Grid, Typography } from '@mui/material'

export default function RatingSheet() {
  return (
    <Grid container spacing={4} px={4} py={5} justifyContent={"space-between"}>
      <Card variant="outlined" sx={{ width: "45%", padding: "15px", border: "3px solid #c2c2c2", borderRadius: "15px" }}>
        <Grid container item xs={12}>
          <Grid item xs={12} mb={5}>
            <Typography variant="h4" component="h2">
              Parameters
            </Typography>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Management Risk
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -4.52
              </Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Business Risk
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -7.62
              </Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Financial Risk
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -3.52
              </Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Idustry Risk
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -1.52
              </Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Total Risk Score
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -17.18
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Card>
      <Card variant="outlined" sx={{ width: "45%", padding: "15px", border: "3px solid #c2c2c2", borderRadius: "15px" }}>
        <Grid container item xs={12}>
          <Grid item xs={12} mb={5}>
            <Typography variant="h4" component="h2">
              Notching
            </Typography>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                General Nothing (Down)
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -1.00
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Project Notching (Down)
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -1.00
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Total Notch Down
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -2.00
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Standalone Rating Grade Number after General & Project notch down
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                0
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Card>
      <Card variant="outlined" sx={{ width: "100%",marginTop:"2.5rem", padding: "15px", border: "3px solid #c2c2c2", borderRadius: "15px" }}>
        <Grid container item xs={12}>
          <Grid item xs={12} mb={5}>
            <Typography variant="h4" component="h2">
              For INC Cases
            </Typography>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                INC Nothing (Down)
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -1.00
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Rating Grade Number After INC Notch down
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -1.00
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                <b>Rating Grade after INC Notch down</b>
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                <b>B+</b>
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Final Rating Grade No.
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                -2.00
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography component="span" sx={{ color: "#676363", fontSize: "1rem" }}>
                Standalone Rating Grade Number after General & Project notch down
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign={"right"}>
              <Typography component="span" sx={{ fontSize: "1rem" }}>
                0
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  )
}
