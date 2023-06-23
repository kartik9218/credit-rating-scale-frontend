import { Box, Grid } from '@mui/material'
import { DashboardLayout } from 'layouts'
import React from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'

const LetterConfigurator = () => {
  return (
    <DashboardLayout>
        <CardWrapper
         headerTitle={"Letter Configurator"}
         headerSubtitle={"Rating Letter"}
        >
            <Box>
            <Grid container spacing={2} paddingX={"1rem"}>
              <Grid item xs={3}>
                <Box height={"calc(100vh - 34vh)"} width={"100%"} sx={{background:"lightblue", borderRadius:"10px"}}></Box>
              </Grid>
              <Grid item xs={9}>
              <Box height={"calc(100vh - 34vh)"} width={"100%"} sx={{background:"lightblue", borderRadius:"10px"}}></Box>
              </Grid>
            </Grid>
            </Box>
        </CardWrapper>
    </DashboardLayout>
  )
}

export default LetterConfigurator