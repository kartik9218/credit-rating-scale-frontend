import { Autocomplete, Grid, Stack, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import DashboardLayout from 'layouts/DashboardLayout'
import React, { useEffect, useState } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'
import { DataGrid } from '@mui/x-data-grid'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { GENERATE_UUID } from 'helpers/Base'

const VotingStatus = () => {
  const [rows, setRows] = useState([])

  const [committeeTypeOptions, setCommitteeTypeOptions] = useState([])
  const [committeeCategories, setCommitteeCategories] = useState([])
  const [Flag, setFlag] = useState(false)

  const [SelectedCommitteeType, setSelectedCommitteeType] = useState({ label: '', value: '' })
  const [SelectedCommitteeCategory, setSelectedCommitteeCategory] = useState({ label: '', value: '' })
  const [FilterMeetingOptions, setFilterMeetingOptions] = useState([])
  const [MeetingOptions, setMeetingOptions] = useState([])

  const [SelectedMeeting, setSelectedMeeting] = useState({ label: '', value: '' })

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
      .catch((err) => {

      })
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
    if (
      SelectedCommitteeCategory.value?.length &&
      SelectedCommitteeType.value?.length &&
      SelectedMeeting.value?.length &&
      FilterMeetingOptions.length
    ) {
      getVotingStatus(SelectedMeeting.value)
    }
  }, [SelectedMeeting, FilterMeetingOptions])

  const getVotingStatus = (M_ID = null) => {
    let where = M_ID ? { rating_committee_meeting_uuid: M_ID } : {}
    HTTP_CLIENT(APIFY('/v1/voting/status'), { params: where })
      .then((data) => {
        if (data['success']) {
          const { voting_status } = data
          setRows(voting_status)
        }
      })
      .catch((err) => {

      })
  }

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
    if (Flag) setSelectedMeeting({ label: '', value: '' })
    if (MeetingOptions.length) setFlag(true)
  }, [SelectedCommitteeCategory, SelectedCommitteeType, MeetingOptions])

  useEffect(() => {
    fetchRatingCommitteeTypes()
    fetchRatingCommitteeCategories()
    getMeetings()

    SET_PAGE_TITLE('Voting Status Screen')
  }, [])

  const columns = [
    {
      field: 'company_name',
      headerName: 'Name of Company',
      sortable: true,
      width: 200,
    },
    {
      field: 'gen_mandate_id',
      headerName: 'Mandate ID',
      sortable: true,
      width: 200,
    },
    {
      field: 'instrument_name',
      headerName: 'Instrument Type',
      sortable: true,
      width: 200,
    },
    {
      field: 'group_head',
      headerName: 'Group Head',
      sortable: true,
      width: 200,
    },
    {
      field: 'rating_team_recommendation',
      headerName: 'Rating Team Recommendation',
      sortable: true,
      width: 200,
    },
    {
      field: 'rating_team_noncommendation',
      headerName: 'Rating Team Non-cooperation',
      sortable: true,
      width: 200,
    },
    {
      field: 'members_rating',
      headerName: 'RC Members Rating',
      sortable: true,
      width: 200,
    },
    {
      field: 'rc_members_output',
      headerName: 'RC Members Outlook',
      sortable: true,
      width: 200,
    },
    {
      field: 'dissent',
      headerName: 'Dissent',
      sortable: true,
      width: 200,
      renderCell: (params) => {
        return <>
          {params.value ? "Yes" : "No"}
        </>
      },
    },
    {
      field: 'dissent_remark',
      headerName: 'Dissent Remarks',
      sortable: true,
      width: 200,
    },
    {
      field: 'voting_status',
      headerName: 'Status',
      sortable: true,
      width: 200,
    },
  ]

  return (
    <>
      <DashboardLayout>
        <CardWrapper headerTitle="Voting Status Screen">
          <Box sx={{ mt: '-2rem', px: '0.8rem' }}>
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '5px 40px 0px 0px' }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '5px 40px 20px 0px' }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '5px 40px 20px 0px' }}>
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

            <Typography sx={{ color: '#344767', fontSize: '16px' }}><b>Mandate List</b></Typography>
            <Grid sx={{ mt: '5px', height: 400, width: '100%' }}>
              <DataGrid
                sx={{ fontSize: '13px' }}
                getRowId={() => GENERATE_UUID()}
                rows={rows}
                columns={columns}
                hideFooter
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 100000, page: 0 },
                  },
                }}
                components={{
                  NoRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                      No data to show. Select voting options from above to get data.
                    </Stack>
                  ),
                }}
                disableSelectionOnClick
              />
            </Grid>
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}

export default VotingStatus
