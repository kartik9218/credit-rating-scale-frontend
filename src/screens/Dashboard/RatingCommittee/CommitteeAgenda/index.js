import React, { useEffect, useRef, useState } from 'react'
import { Autocomplete, Box, Button, Dialog, DialogActions, Stack, TextField, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { DataGrid } from '@mui/x-data-grid'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import ImportExportOutlinedIcon from '@mui/icons-material/ImportExportOutlined'
import DashboardLayout from 'layouts/DashboardLayout'
import CardWrapper from 'slots/Cards/CardWrapper'
import ViewMenu from './ViewMenu'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import './pdfTableStyle.css'

import { GET_QUERY, GET_DATA } from 'helpers/Base'
import colors from 'assets/theme/base/colors'
import { Link } from 'react-router-dom'
import ExportPopover from './ExportPopover'
import GeneratePdf from './GeneratePdf'
import jsPDF from 'jspdf'
import moment from 'moment/moment'

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
            Financial Spread
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

const CommitteeAgenda = () => {
  const agendaPdfRef = useRef(null)
  const tablePdfRef = useRef(null)
  const user = GET_DATA('user')
  const active_role = GET_DATA('active_role')
  const [URL, setURL] = useState({})
  const [pdfState, setPdfState] = useState(false)
  const [Active, setActive] = useState(0)
  const [rows, setRows] = useState([])
  const [committeeTypeOptions, setCommitteeTypeOptions] = useState([])
  const [committeeCategories, setCommitteeCategories] = useState([])
  const [generateData, setGenerateData] = useState([])
  const [SelectedCommitteeType, setSelectedCommitteeType] = useState({ label: '', value: '' })
  const [SelectedCommitteeCategory, setSelectedCommitteeCategory] = useState({ label: '', value: '' })
  const [FilterMeetingOptions, setFilterMeetingOptions] = useState([])
  const [MeetingOptions, setMeetingOptions] = useState([])
  const [companyName, setCompanyName] = useState({})
  const [SelectedMeeting, setSelectedMeeting] = useState({ label: '', value: '' })
  const [Flag, setFlag] = useState(false)
  const [Permit, setPermit] = useState(
    (active_role.role.permissions.find((val) => val.name === 'RatingCommittee.CommitteeAgenda') ? true : false) ||
      user.is_super_account,
  )

  useEffect(() => {
    SET_PAGE_TITLE('Committee Agenda')
    getMeetingInfo()
  }, [])

  const handleAgendaPdfDownload = () => {
    let content = agendaPdfRef.current
    let doc = new jsPDF()
    doc.html(content, {
      callback: function (doc) {
        doc.save('agenda.pdf')
      },
      html2canvas: { scale: 0.164 },
    })
  }

  const handleTablePdfDownload = () => {
    let content = tablePdfRef.current
    let doc = new jsPDF()
    doc.html(content, {
      callback: function (doc) {
        doc.save('doc.pdf')
      },
      html2canvas: { scale: 0.164 },
    })
  }
  const getCommitteeAgenda = (M_ID) => {
    HTTP_CLIENT(APIFY('/v1/committee_agenda/view'), {
      params: {
        rating_committee_meeting_uuid: M_ID || GET_QUERY('uuid'),
      },
    })
      .then((data) => {
        const { committee_agendas } = data
        // console.log(committee_agendas, 'committee_agendas')

        if (data['success']) setRows(committee_agendas)
      })
      .catch((err) => {})
  }

  const fetchData = () => {
    HTTP_CLIENT(APIFY('/v1/committee_agenda/generate'), {
      params: {
        rating_committee_meeting_uuid: SelectedMeeting.value || GET_QUERY('uuid'),
      },
    })
      .then((data) => {
        const { committee_agendas } = data
        if (data['success']) setGenerateData(committee_agendas)
      })
      .catch((err) => {
        console.error(err)
      })
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
            value: rating_committee_meeting.rating_committee_meeting_category.uuid,
            label: rating_committee_meeting.rating_committee_meeting_category.name,
          })
          setSelectedCommitteeType({
            value: rating_committee_meeting.rating_committee_type.uuid,
            label: rating_committee_meeting.rating_committee_type.name,
          })
          let time = new Date()
          time.setHours(Number(rating_committee_meeting.meeting_at.substr(11, 2)))
          time.setMinutes(Number(rating_committee_meeting.meeting_at.substr(14, 2)))

          setSelectedMeeting({
            value: rating_committee_meeting.uuid,
            label: `${rating_committee_meeting.meeting_at.substr(0, 10)} ${time.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })} `,
          })
        }
      })
      .catch((err) => {})
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
          setMeetingOptions
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
      .catch((err) => {})
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
  const downloadDocuments = async (company_uuid) => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_data/view_documents'), {
      params: { company_uuid },
    }).then((response) => {
      if (response['success']) {
        const committee_metadata_document = response['committee_metadata_document']
        setURL({ ...committee_metadata_document })
      }
    })
  }
  useEffect(() => {
    if (pdfState) {
      handleTablePdfDownload()
    }
    return () => {
      setPdfState(false)
    }
  }, [pdfState])

  useEffect(() => {
    fetchRatingCommitteeTypes()
    fetchRatingCommitteeCategories()
    getMeetings()

    SET_PAGE_TITLE('Committee Agenda')
  }, [])

  useEffect(() => {
    const companyNameData = {}
    ;(() => {
      for (let i = 0; i < generateData.length; i++) {
        if (!companyNameData[generateData[i].name]) {
          companyNameData[generateData[i].name] = []
          companyNameData[generateData[i].name].push(generateData[i])
        } else {
          companyNameData[generateData[i].name].push(generateData[i])
        }
      }
    })()
    setCompanyName(companyNameData)
  }, [generateData])

  useEffect(() => {
    if (
      SelectedCommitteeCategory.value?.length &&
      SelectedCommitteeType.value?.length &&
      SelectedMeeting.value?.length &&
      FilterMeetingOptions.length
    ) {
      getCommitteeAgenda(SelectedMeeting.value)
    }
    fetchData()
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
    if (Flag) setSelectedMeeting({ label: '', value: '' })
    if (MeetingOptions.length) setFlag(true)
  }, [SelectedCommitteeCategory, SelectedCommitteeType, MeetingOptions])

  const columns = [
    {
      field: 'name',
      headerName: 'Name of Company',
      width: 200,
      valueGetter: (params) => `${params.row?.name}`,
    },
    {
      field: 'viewDocument',
      headerName: 'View Document',
      width: 200,
      renderCell: (params) => {
        return (
          <>
            {Active == params.row?.mandate_id && (
              <div style={{ position: 'fixed', zIndex: '1600', marginTop: '140px' }}>
                <ViewMenu setOpen={setActive} URL={URL} />
              </div>
            )}
            <label
              style={{ color: 'slateblue', cursor: 'pointer' }}
              onClick={() => {
                if (Active === params.row?.mandate_id) setActive(0)
                else setActive(params.row?.mandate_id)

                downloadDocuments(params.row?.uuid)
              }}
            >
              <u>View</u>
            </label>
          </>
        )
      },
    },
    {
      field: 'mandate',
      headerName: 'Mandate ID',
      width: 200,
      valueGetter: (params) => params.row?.mandate_id,
    },
    {
      field: 'mandate_type',
      headerName: 'Category',
      width: 200,
      //  valueGetter: (params) => params.row?.category_text,
    },

    {
      field: 'total_size',
      headerName: 'Total Size (in Cr.)',
      width: 200,
      valueGetter: (params) => params.row?.total_size?.toFixed(2),
    },
    {
      field: 'agenda_type',
      headerName: 'Agenda Type',
      width: 200,
      valueGetter: (params) => params.row?.agenda,
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
        <CardWrapper
          headerTitle="Committee Agenda"
          headerActionButton={() => {
            return (
              <Link to="/dashboard/rating-committee/meetings">
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    'backgroundColor': '#3c5cd2',
                    'color': '#ffffff',
                    // 'ml': '2rem',
                    'marginRight': '27px',
                    'marginTop': '10px',
                    'display': 'flex',
                    'alignItems': 'center',
                    '&:hover': {
                      backgroundColor: '#3c5cd2',
                      color: '#ffffff',
                    },
                  }}
                >
                  Back
                </Button>
              </Link>
            )
          }}
        >
          <Box sx={{ padding: '0.8rem', mt: '-3rem' }}>
            <Box sx={{ display: 'flex' }}>
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
                    disabled={!Permit}
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
                    disabled={!Permit}
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
                    disabled={!Permit}
                    onChange={(e, val) => {
                      setSelectedMeeting(val)
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Meeting Date and Time" />}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '450px !important', margin: '5px 16px 35px 50px' }}>
                <Button
                  onClick={handleAgendaPdfDownload}
                  variant="contained"
                  sx={{
                    'backgroundColor': colors.primary.main,
                    'color': 'white !important',
                    'padding': '2px 15px',
                    'margin': '5px 15px',
                    'fontSize': '13px !important',
                    '&:hover': {
                      backgroundColor: '#4159de',
                    },
                  }}
                >
                  <InsertDriveFileOutlinedIcon sx={{ mr: '0.25rem' }} />
                  Generate Agenda
                </Button>

                <ExportPopover setPdfState={setPdfState} logData={rows} />
                {/* <Button
                  variant="contained"
                  sx={{
                    'backgroundColor': colors.primary.main,
                    'color': 'white !important',
                    'padding': '2px 15px',
                    'fontSize': '13px !important',
                    '&:hover': {
                      backgroundColor: '#4159de',
                    },
                  }}
                >
                  <ImportExportOutlinedIcon sx={{ mr: '0.25rem' }} />
                  Export Excel
                </Button> */}
                {/* <Button
                  variant="contained"
                  sx={{
                    'backgroundColor': colors.primary.main,
                    'color': 'white !important',
                    'padding': '2px 15px',
                    'fontSize': '13px !important',
                    '&:hover': {
                      backgroundColor: '#4159de',
                    },
                  }}
                >
                  <PictureAsPdfOutlinedIcon sx={{ mr: '0.25rem' }} />
                  Export PDF
                </Button> */}
              </Box>
            </Box>

            <Box sx={{ height: 425, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                sx={{ fontSize: '13px' }}
                className="MuiDataGridCssAdjust"
                getRowId={(row) => row?.mandate_id}
                components={{
                  NoRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                      No agenda to show. Select meeting options from above.
                    </Stack>
                  ),
                }}
                columnVisibilityModel={{ created_at: false }}
                hideFooterSelectedRowCount
                hideFooter
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 1000, page: 0 },
                  },
                }}
              />
            </Box>
          </Box>
          <Box sx={{ visibility: 'hidden', width: '100%' }}>
            <div ref={tablePdfRef} style={{ width: '100%' }}>
              <table style={{ margin: '1rem' }}>
                <tr>
                  <th>Name of Company</th>
                  <th>Mandate ID</th>
                  <th>Mandate Category</th>
                  <th>Total Size (in Cr.)</th>
                  <th>Agenda Type</th>
                  <th>Voting Status</th>
                </tr>

                {rows.map((row, key) => {
                  return (
                    <tr key={key}>
                      <td>{row.name}</td>
                      <td>{row.mandate_id}</td>
                      <td>{row.mandate_type}</td>
                      <td>{row.total_size.toFixed(2)}</td>
                      <td>{''}</td>
                      <td>{row.voting_status}</td>
                    </tr>
                  )
                })}
              </table>
            </div>
          </Box>
          <Box sx={{ visibility: 'hidden', width: '100%' }}>
            {/* <GeneratePdf data={rows} /> */}
            <div ref={agendaPdfRef} id="toolbar" style={{ width: '100%' }}>
              <p style={{ 'margin': 'auto', 'text-align': 'center' }}>
                <span
                  style={{
                    'font-size': '19pt',
                    'font-family': 'Cambria, serif',
                  }}
                ></span>
                <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>I</span>
                <span
                  style={{
                    'font-size': '14pt',
                    'font-family': 'Cambria, serif',
                    'marginRight': '1rem',
                  }}
                >
                  NFOMERICS
                </span>
                <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>V</span>
                <span
                  style={{
                    'font-size': '14pt',
                    'font-family': 'Cambria, serif',
                  }}
                >
                  ALUATION{' '}
                  <span
                    style={{
                      'font-size': '14pt',
                      'font-family': 'Cambria, serif',
                      'margin': '0 1rem',
                    }}
                  >
                    AND
                  </span>
                </span>
                <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>R</span>
                <span
                  style={{
                    'font-size': '14pt',
                    'font-family': 'Cambria, serif',
                    'marginRight': '1rem',
                  }}
                >
                  ATING
                </span>
                <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>P</span>
                <span
                  style={{
                    'font-size': '14pt',
                    'font-family': 'Cambria, serif',
                    'marginRight': '1rem',
                  }}
                >
                  RIVATE
                </span>
                <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>L</span>
                <span
                  style={{
                    'font-size': '14pt',
                    'font-family': 'Cambria, serif',
                  }}
                >
                  IMITED
                </span>
              </p>
              <p className="ql-align-center" style={{ 'text-align': 'center' }}>
                <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>
                  Head Office-Flat No. 104/106/108, Golf Apartments, Sujan Singh Park,
                </span>
              </p>
              <p className="ql-align-center" style={{ 'text-align': 'center' }}>
                <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>&nbsp;New Delhi-110003,</span>
              </p>
              <p className="ql-align-center" style={{ 'text-align': 'center' }}>
                <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>Email:</span>
                <a
                  rel="noreferrer"
                  href="mailto:vma@infomerics.com"
                  target="_blank"
                  style={{
                    'font-size': '12pt',
                    'font-family': ' Cambria, serif',
                    ' color': 'rgb(5, 99, 193)',
                  }}
                >
                  {' '}
                  vma@infomerics.com
                </a>
                <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>, Website:</span>
                <span
                  style={{
                    'font-size': '12pt',
                    'font-family': 'Cambria, serif',
                    'color': 'rgb(5, 99, 193)',
                  }}
                >
                  {' '}
                  www.infomerics.com
                </span>
              </p>
              <p className="ql-align-center" style={{ 'text-align': 'center' }}>
                <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>
                  Phone: +91-11 24601142, 24611910, Fax: +91 11 24627549
                </span>
              </p>
              <p className="ql-align-center" style={{ 'text-align': 'center' }}>
                <span style={{ 'font-size': '12pt', 'font-family': ' Cambria, serif' }}>(CIN: U32202DL1986PTC024575)</span>
              </p>
              <p className="ql-align-center">
                <br />
              </p>
              <p
                className="ql-align-center"
                style={{
                  'text-align': 'center',
                }}
              >
                <u
                  style={{
                    'font-size': '12pt',
                    'font-family': ' &quot,Times New Roman&quot',
                  }}
                >
                  AGENDA
                </u>
              </p>
              <p>
                <br />
              </p>
              <p className="ql-align-justify" style={{ margin: '-1rem 1rem -5rem 1rem' }}>
                <span
                  style={{
                    'font-size': '12pt',
                    'font-family': '&quot,Times New Roman&quot',
                  }}
                >
                  Agenda for {generateData[0]?.meeting_id} Rating Committee Meeting (RCM) for the Financial Year 2022- 2023
                  of Infomerics Valuation and Rating Private Limited to be held on{' '}
                  {moment(generateData[0]?.meeting_at).format('dddd, Do MMMM YYYY ')} at{' '}
                  {moment(generateData[0]?.meeting_at).format('hh:mm a')} through video conference.
                </span>
              </p>
              <p className="ql-align-justify">
                <br />
              </p>
              <p className="ql-align-justify">
                <br />
              </p>
              <p className="ql-align-justify" style={{ margin: ' 5rem 1rem 0 1rem' }}>
                <span
                  style={{
                    'font-size': '12pt',
                    'font-family': '&quot,Times New Roman&quot',
                  }}
                >
                  To confirm the minutes of the 89th Committee meeting held on 01st March 2023.
                </span>
              </p>
              <p className="ql-align-justify" style={{ margin: '1rem 1rem -2rem 1rem' }}>
                <span
                  style={{
                    'font-size': '12pt',
                    'font-family': '&quot,Times New Roman&quot',
                  }}
                >
                  To consider following proposal for rating: -
                </span>
              </p>
              <p className="ql-align-justify">
                <br />
              </p>
              <p className="ql-align-justify">
                <br />
              </p>

              <table style={{ margin: '0 1rem' }}>
                <tr>
                  <th>S. No.</th>
                  <th>Name of the Entity</th>
                  <th>Instrument / Facility</th>
                  <th>Size (Rs. crore)</th>
                  <th>Nature of Assignment</th>
                </tr>
                {Object.keys(companyName).map((company, i) => {
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td rowSpan={1}>{companyName[company][0].name}</td>
                      <td>
                        {companyName[company].map((c, index) => {
                          return (
                            <tr key={index} style={{ border: 'none', display: 'flex', flexWrap: 'wrap' }}>
                              <td
                                style={{
                                  border: 'none',
                                  width: '100%',
                                  borderTop: index > 0 ? '1px solid black' : 'none',
                                }}
                              >
                                {c.instrument_text}
                              </td>
                            </tr>
                          )
                        })}
                      </td>
                      <td>
                        {companyName[company].map((c, index) => {
                          return (
                            <tr key={index} style={{ border: 'none', display: 'flex', flexWrap: 'wrap' }}>
                              <td
                                style={{
                                  border: 'none',
                                  width: '100%',
                                  borderTop: index > 0 ? '1px solid black' : 'none',
                                }}
                              >
                                {c.instrument_size_number?.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })}
                      </td>
                      <td>
                        {companyName[company].map((c, index) => {
                          return (
                            <tr key={index} style={{ border: 'none', display: 'flex', flexWrap: 'wrap' }}>
                              <td
                                style={{
                                  border: 'none',
                                  width: '100%',
                                  borderTop: index > 0 ? '1px solid black' : 'none',
                                }}
                              >
                                {c.rating_process}
                              </td>
                            </tr>
                          )
                        })}
                      </td>
                    </tr>
                  )
                })}
              </table>
            </div>
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}

export default CommitteeAgenda

CommitteeAgenda.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
}

ViewModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
}
