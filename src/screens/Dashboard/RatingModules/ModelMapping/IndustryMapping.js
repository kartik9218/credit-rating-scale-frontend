import { Button, DialogContentText, Grid, Typography } from '@mui/material'
import { Box } from '@mui/system'
import DashboardLayout from 'layouts/DashboardLayout'
import React, { useEffect, useState } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'
import CloseIcon from '@mui/icons-material/Close'
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { GET_QUERY } from 'helpers/Base'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import ArgonSnackbar from 'components/ArgonSnackbar'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { ArrowBackRounded } from '@mui/icons-material'

const ShowIndustries = ({ subIndustries, uuid }) => {
  const [industries, setIndustries] = useState([])
  const [warningModal, setWarningModal] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState('')

  const handleFilterindustries = () => {
    let filteredMembersArr = industries.filter((mem) => selectedIndustry.sub_industry_uuid !== mem.sub_industry_uuid)
    setIndustries(filteredMembersArr)
  }
  const updateModelList = () => {
    HTTP_CLIENT(APIFY('/v1/industry_model_mapping/edit'), {
      params: {
        rating_model_uuid: uuid,
        sub_industry_uuid: selectedIndustry.sub_industry_uuid,
      },
    })
      .then((data) => {
        const {} = data
        handleFilterindustries()
      })
      .catch((err) => console.error(err))
  }
  useEffect(() => {
    if (subIndustries.length > 0) {
      setIndustries(subIndustries)
    }
  }, [subIndustries.length])
  return (
    <>
      {/* <Dialog fullWidth maxWidth="sm" open={warningModal} onClose={() => setWarningModal(false)} sx={{ zIndex: 1600 }}>
        <DialogTitle textAlign="center" color="red">
          Are you sure to delete this industry type
        </DialogTitle>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            sx={{
              'backgroundColor': '#3c5cd2',
              'color': '#ffffff',
              'ml': '2rem',
              'display': 'flex',
              'alignItems': 'center',
              '&:hover': {
                backgroundColor: '#3c5cd2',
                color: '#ffffff',
              },
            }}
            onClick={() => setWarningModal(false)}
          >
            No
          </Button>
          <Button
            variant="contained"
            sx={{
              'backgroundColor': '#2dce89',
              'color': '#ffffff',
              'ml': '2rem',
              'borderRadius': '0.5rem',
              'padding': '0.6rem 1.4rem',
              '&:hover': {
                backgroundColor: '#2dce89',
                color: '#ffffff',
              },
            }}
            onClick={() => {
              setWarningModal(false)
              updateModelList()
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog> */}
      <Dialog
        maxWidth="xs"
        open={warningModal}
        onClose={() => setWarningModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ zIndex: 1600 }}
      >
        <DialogTitle sx={{ fontWeight: '400', fontSize: '1.1rem' }} id="alert-dialog-title">
          {'Are you sure to delete this industry type'}
        </DialogTitle>
        <DialogActions>
          <Button sx={{ fontWeight: '400' }} onClick={() => setWarningModal(false)}>
            No
          </Button>
          <Button
            sx={{ fontWeight: '400' }}
            onClick={() => {
              setWarningModal(false)
              updateModelList()
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          border: '1px solid',
          borderColor: 'gray',
          borderRadius: '1rem',
          minHeight: '2rem',
        }}
      >
        {industries?.map((subIndustry) => {
          return (
            <React.Fragment key={subIndustry.sub_industry_uuid}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderRadius: '1rem',
                  m: '0.5rem',
                  pr: '0.5rem',
                }}
              >
                <Typography sx={{ mx: '0.8rem', fontSize: '13px' }}>{subIndustry.sub_industry_name}</Typography>
                <CloseIcon
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setWarningModal(true)
                    setSelectedIndustry(subIndustry)
                  }}
                />
              </Box>
            </React.Fragment>
          )
        })}
      </Box>
    </>
  )
}

const IndustryMapping = () => {
  const uuid = GET_QUERY('uuid')
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [subIndustries, setSubIndustries] = useState([])

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true)
    setResponse(messageType)
    setSnackbarMessage(message)
  }
  const getIndustriesData = () => {
    HTTP_CLIENT(APIFY('/v1/industry_model_mapping/view'), {
      params: {
        rating_model_uuid: uuid,
      },
    })
      .then((data) => {
        const { industry_model_mapping } = data
        setSubIndustries(industry_model_mapping)
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }
  useEffect(() => {
    SET_PAGE_TITLE('Industry Mapping')
  }, [])
  useEffect(() => {
    getIndustriesData()
  }, [])
  return (
    <>
      <DashboardLayout>
        <CardWrapper
          headerTitle="Industry Mapping"
          headerActionButton={() => {
            return (
              <>
                <HasPermissionButton
                  color="primary"
                  permissions={[`/dashboard/rating-modules/model-mapping`]}
                  route={GET_ROUTE_NAME('LIST_MODEL_MAPPING')}
                  text={`Back to List of Model Mapping`}
                  icon={<ArrowBackRounded />}
                />
              </>
            )
          }}
        >
          <Box sx={{ mx: '0.8rem' }}>
            <Grid container sx={{}}>
              <Grid item xs={1.6}>
                <Typography sx={{ fontSize: '13px' }} noWrap>
                  Model Name:{' '}
                </Typography>
              </Grid>
              <Grid>
                <Typography sx={{ fontSize: '13px' }}>{subIndustries[0]?.rating_model_name}</Typography>
              </Grid>
            </Grid>
            <Grid container my="1.4rem">
              <Grid item xs={1.6}>
                <Typography sx={{ fontSize: '13px' }} noWrap>
                  Mapped Industries:{' '}
                </Typography>
              </Grid>
              <Grid item xs={10}>
                {<ShowIndustries uuid={uuid} subIndustries={subIndustries} />}
              </Grid>
            </Grid>
            <Link to="/dashboard/rating-modules/model-mapping">
              <Button
                variant="contained"
                sx={{
                  'backgroundColor': '#2dce89',
                  'color': '#ffffff',
                  'float': 'right',
                  'borderRadius': '0.5rem',
                  'padding': '0.6rem 1.4rem',
                  '&:hover': {
                    backgroundColor: '#2dce89',
                    color: '#ffffff',
                  },
                }}
              >
                Save
              </Button>
            </Link>
          </Box>
          <ArgonSnackbar
            color={response}
            icon={response ? response : 'error'}
            title={response === 'success' ? 'Success' : response === 'error' ? 'Error' : ''}
            content={snackbarMessage}
            translate="yes"
            dateTime=""
            open={snackbarOpen}
            close={onCloseSnackbar}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          />
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}

export default IndustryMapping

ShowIndustries.propTypes = {
  subIndustries: PropTypes.array,
  uuid: PropTypes.string,
}
