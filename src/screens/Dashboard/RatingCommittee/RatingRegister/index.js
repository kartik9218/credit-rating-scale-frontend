import React, { useEffect, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import { DataGrid } from '@mui/x-data-grid'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import DashboardLayout from 'layouts/DashboardLayout'
import CardWrapper from 'slots/Cards/CardWrapper'
import { SET_PAGE_TITLE, GET_QUERY } from 'helpers/Base'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'

const ViewModal = ({ open, setOpen }) => {
  return (
    <>
      <Dialog
        hideBackdrop
        PaperProps={{
          sx: {
            position: 'absolute',
            maxWidth: '180px',
            top: '42.5%',
            right: '49.5%',
          },
        }}
        sx={{
          zIndex: '1600',
        }}
        open={open}
        onClose={() => setOpen(false)}
      >
        <DialogActions
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: 0,
          }}
        >
          <Button
            sx={{
              'color': '#434343',
              'padding': '0.6rem 1.4rem',
              'borderBottom': '1px solid',
              'borderRadius': '0',
              'width': '100%',
              '&:hover': {
                color: '#434343',
              },
            }}
          >
            Rating Note
          </Button>
          <Button
            sx={{
              'color': '#434343',
              'padding': '0.6rem 1.4rem',
              'borderBottom': '1px solid',
              'borderRadius': '0',
              'width': '100%',
              'marginLeft': '0 !important',
              '&:hover': {
                color: '#434343',
              },
            }}
          >
            Financial Spread{' '}
          </Button>
          <Button
            sx={{
              'color': '#434343',
              'padding': '0.6rem 1.4rem',
              'marginLeft': '0 !important',
              'borderBottom': '1px solid',
              'borderRadius': '0',
              'width': '100%',
              '&:hover': {
                color: '#434343',
              },
            }}
          >
            Rating Model
          </Button>
          <Button
            sx={{
              'color': '#434343',
              'padding': '0.6rem 1.4rem',
              'marginLeft': '0 !important',
              'width': '100%',
              '&:hover': {
                color: '#434343',
              },
            }}
          >
            Other Documents
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const RatingRegister = () => {
  const [URL, setURL] = useState({})
  const [Active, setActive] = useState(0)
  const [rows, setRows] = useState([])
  const [committeeTypeOptions, setCommitteeTypeOptions] = useState([])
  const [committeeCategories, setCommitteeCategories] = useState([])
  const [SelectedCommitteeType, setSelectedCommitteeType] = useState('')
  const [SelectedCommitteeCategory, setSelectedCommitteeCategory] = useState('')
  const [SelectedMeeting, setSelectedMeeting] = useState('')
  const [FilterMeetingOptions, setFilterMeetingOptions] = useState([])
  const [MeetingOptions, setMeetingOptions] = useState([])

  const [Flag, setFlag] = useState(false)

  const getRegisterData = (M_ID) => {
    HTTP_CLIENT(APIFY('/v1/rating_register'), {
      params: {
        rating_committee_meeting_uuid: M_ID || GET_QUERY('uuid'),
      },
    })
      .then((data) => {
        const { rating_register } = data
        if (data['success']) {
          rating_register.forEach((rRegister, key) => {
            rating_register[key].id = key + 1;
          })
          setRows(rating_register)
        }
      })
      .catch((err) => { })
  }

  const getMeetingInfo = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view'), {
      params: {
        uuid: GET_QUERY('uuid'),
      },
    })
      .then((data) => {
        if (data['success']) {
          const { rating_committee_meeting } = data

          setSelectedCommitteeCategory({
            value: rating_committee_meeting?.rating_committee_meeting_category?.uuid,
            label: rating_committee_meeting?.rating_committee_meeting_category?.name,
          })
          setSelectedCommitteeType({
            value: rating_committee_meeting?.rating_committee_type?.uuid,
            label: rating_committee_meeting?.rating_committee_type?.name,
          })
          let time = new Date()
          time.setHours(Number(rating_committee_meeting?.meeting_at?.substr(11, 2)))
          time.setMinutes(Number(rating_committee_meeting?.meeting_at?.substr(14, 2)))

          setSelectedMeeting({
            value: rating_committee_meeting?.uuid,
            label: `${rating_committee_meeting?.meeting_at?.substr(0, 10)} ${time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`,
          })
        }
      })
      .catch((err) => { })
  }

  const fetchRatingCommitteeTypes = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_types'), { params: { is_active: true } }).then((response) => {
      const rating_committee_types = response['rating_committees']
      let temp = rating_committee_types.map((val) => {
        return {
          label: val.name,
          value: val.uuid,
        }
      })

      setCommitteeTypeOptions([...temp])
    })
  }

  const getMeetings = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings'), { params: {} })
      .then((data) => {
        const { rating_committee_meetings } = data
        let temp = []
        temp = rating_committee_meetings.map((val) => {
          let time = new Date()
          time.setHours(Number(val.meeting_at.substr(11, 2)))
          time.setMinutes(Number(val.meeting_at.substr(14, 2)))

          return {
            ...val,
            value: val.uuid,
            label: `${val.meeting_at.substr(0, 10)} ${time.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })} `,
          }
        })

        setMeetingOptions([...temp])
      })
      .catch((err) => { })
  }

  const fetchRatingCommitteeCategories = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meeting_categories'), {
      params: { is_active: true },
    }).then((response) => {
      const rating_committee_meeting_categories = response['rating_committee_meeting_categories']
      let temp = []
      temp.push(
        rating_committee_meeting_categories.map((val) => {
          return {
            label: val.name,
            value: val.uuid,
          }
        }),
      )
      setCommitteeCategories(...temp)
    })
  }

  useEffect(() => {
    fetchRatingCommitteeTypes()
    fetchRatingCommitteeCategories()
    getMeetings()
    SET_PAGE_TITLE('Rating Register')
    if (GET_QUERY('uuid')) getMeetingInfo()
  }, [])

  const downloadDocuments = async (rating_committee_meeting_register_uuid) => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_data/view_documents'), {
      params: { company_uuid: rating_committee_meeting_register_uuid },
    }).then((response) => {
      if (response['success']) {
        const committee_metadata_document = response['committee_metadata_document']
        setURL({ ...committee_metadata_document })
      }
    })
  }

  useEffect(() => {
    if (
      SelectedCommitteeCategory.value?.length &&
      SelectedCommitteeType.value?.length &&
      SelectedMeeting.value?.length &&
      FilterMeetingOptions?.length
    ) {
      getRegisterData(SelectedMeeting.value)
    }
  }, [SelectedMeeting, FilterMeetingOptions])

  useEffect(() => {
    setFilterMeetingOptions(
      [...MeetingOptions].filter((val) => {
        if (
          SelectedCommitteeCategory.label == val.rating_committee_meeting_category?.name &&
          SelectedCommitteeType?.label == val.rating_committee_type?.name &&
          val.is_active
        ) {
          return val
        }
      }),
    )
    if (Flag) setSelectedMeeting('')
    if (MeetingOptions?.length) setFlag(true)
  }, [SelectedCommitteeCategory, SelectedCommitteeType, MeetingOptions])

  const columns = [
    {
      field: 'company_name',
      headerName: 'Name of Company',
      width: 200,
    },
    // {
    //   field: 'viewDocument',
    //   headerName: 'View Document',
    //   width: 200,
    //   renderCell: (params) => {
    //     return (
    //       <>
    //         {Active == params.row?.id && (
    //           <div style={{ position: 'fixed', zIndex: '1600', marginTop: '140px' }}>
    //             <ViewMenu setOpen={setActive} URL={URL} />
    //           </div>
    //         )}
    //         <label
    //           style={{ color: 'slateblue', cursor: 'pointer' }}
    //           onClick={() => {
    //             if (Active === params.row?.id) setActive(0)
    //             else setActive(params.row?.id)
    //             downloadDocuments(params.row.company_uuid)
    //           }}
    //         >
    //           <u>View</u>
    //         </label>
    //       </>
    //     )
    //   },
    // },
    {
      field: 'mandate_id',
      headerName: 'Mandate ID',
      width: 200,
    },
    {
      field: 'category_name',
      headerName: 'Category',
      width: 200,
    },
    {
      field: 'sub_category_name',
      headerName: 'Sub-Category',
      width: 200,
    },
    {
      field: 'instrument_text',
      headerName: 'Instrument/Facility',
      width: 200,
    },
    {
      field: 'instrument_size_number',
      headerName: 'Size (in Cr.)',
      width: 200,
    },

    {
      field: "assigned_rating",
      headerName: "Rating Assigned",
      width: 200,
    },

    {
      field: "rating_action",
      headerName: "Rating Action",
      width: 200,
    },
    {
      field: 'agenda_type',
      headerName: 'Agenda Type',
      width: 200,
    },
    {
      field: 'long_term_rating_recommendation',
      headerName: 'Rating Recommendation (LT)',
      width: 200,
    },
    {
      field: 'long_term_outlook_recommendation',
      headerName: 'Outlook',
      width: 200,
    },

    {
      field: 'short_term_rating_recommendation',
      headerName: 'Rating Recommendation (ST)',
      width: 200,
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
    },
    {
      field: 'long_term_rating_assgined_text',
      headerName: 'Model Rating (LT)',
      width: 200,
    },
    {
      field: 'outlook2',
      headerName: 'Outlook',
      width: 200,
    },
    {
      field: 'short_term_rating_assgined_text',
      headerName: 'Model Rating (ST)',
      width: 200,
    },
    {
      field: 'previousRating',
      headerName: 'Previous Rating (LT)',
      width: 200,
    },
    {
      field: 'outlook3',
      headerName: 'Outlook',
      width: 200,
    },
    {
      field: 'previousRating2',
      headerName: 'Previous Rating (ST)',
      width: 200,
    },
    {
      field: 'meeting_type',
      headerName: 'Meeting Type',
      width: 200,
    },
    {
      field: 'voting_status',
      headerName: 'Voting Status',
      width: 200,
    },
  ]

  return (
    <>
      <DashboardLayout>
        <CardWrapper headerTitle="Rating Register">
          <Box sx={{ padding: '0.8rem', mt: '-3rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', margin: '10px 0px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '20px 40px 0px 0px' }}>
                  <Typography component="label" variant="caption" fontWeight="bold" sx={{ marginBottom: '10px' }}>
                    Rating Committee Type
                  </Typography>
                  <Autocomplete
                    disableClearable
                    disablePortal
                    options={committeeTypeOptions}
                    value={SelectedCommitteeType}
                    onChange={(e, val) => {
                      setSelectedCommitteeType(val)
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Committee Type" />}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '20px 40px 20px 0px' }}>
                  <Typography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    sx={{ marginBottom: '10px', marginLeft: '0px' }}
                  >
                    Rating Committee Category
                  </Typography>
                  <Autocomplete
                    disableClearable
                    disablePortal
                    options={committeeCategories}
                    value={SelectedCommitteeCategory}
                    onChange={(e, val) => {
                      setSelectedCommitteeCategory(val)
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Committee Category" />}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '20px 40px 20px 0px' }}>
                  <Typography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    sx={{ marginBottom: '10px', marginLeft: '0px' }}
                  >
                    Rating Committee Date and Time
                  </Typography>
                  <Autocomplete
                    disableClearable
                    disablePortal
                    options={[...FilterMeetingOptions].sort((a, b) => new Date(b.label) - new Date(a.label))}
                    value={SelectedMeeting}
                    onChange={(e, val) => {
                      setSelectedMeeting(val)
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Meeting Date and Time" />}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column', width: '450px !important' }}>
                <Button
                  sx={{
                    'backgroundColor': '#F4F7FF',
                    'color': '#344767',
                    'ml': '2rem',
                    'borderRadius': '0.25rem',
                    'border': '1px solid #A8B8D8',

                    '&:hover': {
                      backgroundColor: '#F4F7FF',
                      color: '#344767',
                    },
                  }}
                >
                  <PictureAsPdfOutlinedIcon sx={{ mr: '0.25rem' }} />
                  Generate Register PDF
                </Button>
              </Box>
            </Box>
            <Box sx={{ height: 425, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                sx={{ fontSize: '13px' }}
                hideFooter
                getRowId={(row) => row?.uuid}
                className="MuiDataGridCssAdjust"
                components={{
                  NoRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                      No data to show. Select meeting options from above.
                    </Stack>
                  ),
                }}
                columnVisibilityModel={{ created_at: false }}
                hideFooterSelectedRowCount
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 250, page: 0 },
                  },
                }}
              />
            </Box>
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}

export default RatingRegister

RatingRegister.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
}

ViewModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
}
