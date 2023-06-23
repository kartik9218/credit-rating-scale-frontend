import ArgonButton from 'components/ArgonButton'
import DashboardLayout from 'layouts/DashboardLayout'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'
import { ArgonTypography } from 'components/ArgonTheme'
import ArgonSelect from 'components/ArgonSelect'
import { Autocomplete, Box, Button, Grid, Input, Stack, styled, TextField, Typography } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { DataGrid } from '@mui/x-data-grid'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import { Link } from 'react-router-dom'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { GET_DATA } from 'helpers/Base'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { GET_QUERY } from 'helpers/Base'

function SendToCommittee() {
  const [FilterMeetingOptions, setFilterMeetingOptions] = useState([])
  const [MeetingOptions, setMeetingOptions] = useState([])
  const [OutlookOptions, setOutlookOptions] = useState([])
  const [rows, setRows] = useState([])
  const [committeeTypeOptions, setCommitteeTypeOptions] = useState([])
  const [committeeCategories, setCommitteeCategories] = useState([])
  const [SelectedCommitteeType, setSelectedCommitteeType] = useState({})
  const [SelectedCommitteeCategory, setSelectedCommitteeCategory] = useState('')
  const [SelectedMeeting, setSelectedMeeting] = useState('')
  const [RatingRecommendations, setRatingRecommendations] = useState([])
  const [SelectedIDs, setSelectedIDs] = useState([])
  const [GHInput, setGHInput] = useState({})
  const [document, setDocument] = useState({})
  const [isSnackbarOpen, setIsSnackbarOpen] = useState({ open: false, result: '', title: '' })

  const [RatingSymbolOpt, setRatingSymbolOpt] = useState({})
  const onCloseSnackbar = () => {
    setIsSnackbarOpen({ open: false, result: '', title: '' })
  }

  const user = GET_DATA('user')

  const dataSelect = (checked_ids) => {
    let unchecked_id = [...SelectedIDs].filter((arrEl1) => {
      return [...checked_ids].findIndex((arrEl2) => arrEl1 === arrEl2) == -1
    })

    if (unchecked_id?.length > 0) {
      let unSelectedManIds = [...rows]
        .filter((rowEl) => {
          return unchecked_id.findIndex((ch_id) => ch_id === rowEl.uuid) > -1
        })
        .map((rowEl) => rowEl.mandate.mandate_id)

      let unSelectedDataUuids = [...rows]
        .filter((rowEl) => [...unSelectedManIds].findIndex((arrEl) => arrEl === rowEl.mandate.mandate_id) > -1)
        .map((rowEl) => rowEl.uuid)

      let newSelectedDataUuids = [...SelectedIDs]

      for (let i = 0; i < unSelectedDataUuids.length; i++) {
        let index = newSelectedDataUuids.indexOf(unSelectedDataUuids[i])
        if (index > -1) {
          newSelectedDataUuids.splice(index, 1)
        }
      }

      setSelectedIDs(newSelectedDataUuids)
    } else {
      let selectedManIds = [...rows]
        .filter((rowEl) => {
          return checked_ids.findIndex((ch_id) => ch_id === rowEl.uuid) > -1
        })
        .map((rowEl) => rowEl.mandate.mandate_id)

      let selectedDataUuids = [...rows]
        .filter((rowEl) => [...selectedManIds].findIndex((arrEl) => arrEl === rowEl.mandate.mandate_id) > -1)
        .map((rowEl) => rowEl.uuid)

      setSelectedIDs(selectedDataUuids)
    }
  }

  const columnsData = [
    {
      field: 'mandate',
      headerName: 'Name of Company',
      width: 200,
      pinnable: true,
      renderCell: (params) => {
        return (
          <Link to={`/dashboard/companies/view?uuid=${params.value.company_mandate?.uuid}`} target="_blank">
            {params.value.company_mandate?.name}
          </Link>
        )
      },
    },

    {
      field: 'mandateID',
      headerName: 'Mandate ID',
      width: 200,

      valueGetter: (params) => `${params.row.mandate.mandate_id}`,
    },
    {
      field: 'instrument_category',
      headerName: 'Category',
      width: 200,
      renderCell: (params) => {
        return <p>{params.value?.category_name}</p>
      },
    },
    {
      field: 'instrument_sub_category',
      headerName: 'Sub Category',
      width: 200,
      renderCell: (params) => {
        return <p>{params.value?.category_name}</p>
      },
    },
    {
      field: 'instrument',
      headerName: 'Instrument/Facility',
      width: 200,
      renderCell: (params) => {
        return <p>{params.value?.name}</p>
      },
    },
    {
      field: 'size',
      headerName: 'Size (in Cr.)',
      sortable: false,
      width: 200,
      valueGetter: (params) => `${params.row.instrument_size.toFixed(2) || ''}`,
    },
    {
      field: 'agendaType',
      headerName: 'Agenda Type',

      sortable: false,
      width: 200,
    },
    {
      field: 'rating_recommendation',
      headerName: 'Rating Recommendation (LT)',

      sortable: false,
      width: 200,
      renderCell: (params) => {
        return (
          <Autocomplete
            value={GHInput[params.row?.uuid]?.lt_rating_recommendation}
            // disabled={GHInput[params.row?.uuid]?.st_rating_recommendation?.length > 0 ? true : false}
            // disabled={params.row.instrument_sub_category.category_name.indexOf('LT') < 0}
            options={RatingSymbolOpt[params.row?.uuid] ? RatingSymbolOpt[params.row?.uuid]?.lt : []}
            onChange={(e, value) => {
              let prevVal = { ...GHInput }  
              let prevuuidData = GHInput[params.row?.uuid]
              prevVal[params.row?.uuid] = { ...prevuuidData, lt_rating_recommendation: value?.label }
              setGHInput({ ...prevVal })
            }}
            sx={{ width: 170 }}
            renderInput={(params) => <TextField {...params} placeholder="Select LT rating" />}
          />
        )
      },
    },

    {
      field: 'lt_outlook',
      headerName: 'Outlook',
      width: 200,
      renderCell: (params) => {
        return (
          <Autocomplete
            value={GHInput[params.row?.uuid]?.lt_outlook}
            // disabled={GHInput[params.row?.uuid]?.st_rating_recommendation?.length > 0 ? true : false}
              //  disabled={
              // params.row.instrument_sub_category.category_name.indexOf('LT') < 0 }
            options={OutlookOptions.length > 0 && OutlookOptions}
            sx={{ width: 170 }}
            onChange={(e, value) => {
              let prevVal = { ...GHInput }
              let prevuuidData = GHInput[params.row?.uuid]
              prevVal[params.row?.uuid] = { ...prevuuidData, lt_outlook: value?.label }
              setGHInput({ ...prevVal })
            }}
            renderInput={(params) => (
              <TextField {...params} sx={{ minWidth: '90% !important' }} placeholder="Select LT outlook" />
            )}
          />
        )
      },
    },

    {
      field: 'ratinRecommendation2',
      headerName: 'Rating Recommendation (ST)',
      width: 200,
      renderCell: (params) => {
        return (
          <Autocomplete
            value={GHInput[params.row?.uuid]?.st_rating_recommendation}
            // disabled={GHInput[params.row?.uuid]?.lt_rating_recommendation?.length > 0 ? true : false}
            // disabled={
            //   params.row.instrument_sub_category.category_name.indexOf('ST') < 0 }
            options={RatingSymbolOpt[params.row?.uuid] ? RatingSymbolOpt[params.row?.uuid]?.st : []}
            onChange={(e, value) => {
              let prevVal = { ...GHInput }
              let prevuuidData = GHInput[params.row?.uuid]
              prevVal[params.row?.uuid] = { ...prevuuidData, st_rating_recommendation: value?.label }
              setGHInput({ ...prevVal })
            }}
            sx={{ width: 170 }}
            renderInput={(params) => <TextField {...params} placeholder="Select ST rating" />}
          />
        )
      },
    },

    {
      field: 'remarks',
      headerName: 'Remarks',
      width: 200,
      renderCell: (params) => {
        return (
          <TextField
            id="outlined-multiline-flexible"
            label=""
            value={GHInput[params.row?.uuid]?.remarks}
            onChange={(e) => {
              let prevVal = { ...GHInput }
              let prevuuidData = prevVal[params.row?.uuid]
              prevVal[params.row?.uuid] = { ...prevuuidData, remarks: value.remarks }
              setGHInput({ ...prevVal })
            }}
            multiline
            maxRows={2}
          />
        )
      },
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      valueGetter: (params) => `${params.row.mandate.branch_office.name}`,
    },
    {
      field: 'modelRating',
      headerName: 'Model Rating (LT)',

      sortable: false,
      width: 200,
    },
    {
      field: 'outlook2',
      headerName: 'Outlook',

      sortable: false,
      width: 200,
    },
    {
      field: 'modelRating2',
      headerName: 'Model Rating (ST)',

      sortable: false,
      width: 200,
    },
    {
      field: 'previousRating',
      headerName: 'Previous Rating (LT)',

      sortable: false,
      width: 200,
    },
    {
      field: 'outlook3',
      headerName: 'Outlook',

      sortable: false,
      width: 200,
    },
    {
      field: 'previousRating2',
      headerName: 'Previous Rating (ST)',

      sortable: false,
      width: 200,
    },
  ]

  const fetchRatingCommitteeTypes = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_types'), { params: { is_active: true } }).then((response) => {
      const rating_committee_types = response['rating_committees']
      let temp = []
      temp.push(
        rating_committee_types.map((val) => {
          return {
            label: val?.name,
            value: val?.uuid,
          }
        }),
      )
      setCommitteeTypeOptions(...temp)
    })
  }

  const fetchOutlook = async () => {
    HTTP_CLIENT(APIFY('/v1/outlooks'), { params: {} }).then((response) => {
      const { outlooks } = response
      let temp = []
      temp.push(
        outlooks.map((val) => {
          return {
            label: val?.name,
            value: val?.uuid,
          }
        }),
      )

      setOutlookOptions(...temp)
    })
  }
  const UploadFile = async (rating_committee_meeting_register) => {
    const formData = new FormData()
    document['rating_note'] && formData.append('rating_note', document['rating_note']['file'])
    document['financial'] && formData.append('financial', document['financial']['file'])
    document['other_document'] && formData.append('other_document', document['other_document']['file'])
    formData.append('rating_committee_meeting_register_uuid', rating_committee_meeting_register)

    // for (var pair of formData.entries()) {
    //   if (pair[1] ==undefined) {
    //     formData.delete(`${pair[0]}`)
    //   }
    // }
console.log(document)
    for (var pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1])
    }

    HTTP_CLIENT(
      APIFY(`/v1/rating_committee_data/assign_documents`),

      formData,
      true,
    )
      .then((response) => {
        if (response['success']) {
          setIsSnackbarOpen({ open: true, result: 'success', title: 'Uploaded successfully' })

          setDocument({})

          return
        }
      })
      .catch((error) => {
        setIsSnackbarOpen({ open: true, result: 'error', title: 'Error in uploading file' })
      })
  }
  const fileIsNotValid = (mimetype) => (size) => {
    if (mimetype != 'application/pdf') {
      setIsSnackbarOpen({ open: true, result: 'error', title: 'Select pdf file only' })
      return true
    } else if (size * 0.001 * 0.001 > 5) {
      setIsSnackbarOpen({ open: true, result: 'error', title: 'File Size cannot exceed more than 5mb' })
      return true
    }
  }
  const saveSendToCommittee = async (params) => {
    HTTP_CLIENT(APIFY('/v1/sent_to_committee/create'), {
      params: {
        transaction_instrument_uuid: params?.uuid,
        mandate_uuid: params.mandate?.uuid,
        instrument_category_uuid: params.instrument_category?.uuid,
        instrument_sub_category_uuid: params.instrument_sub_category?.uuid,
        instrument_uuid: params.instrument?.uuid,
        rating_committee_type_uuid: SelectedCommitteeType?.value,
        rating_committee_meeting_uuid: SelectedMeeting?.value,
        rating_committee_meeting_category_uuid: SelectedCommitteeCategory?.value,
        instrument_detail_uuid: params.instrument_detail?.uuid,
        category_text: params.instrument_category?.category_name,
        sub_category_text: params.instrument_sub_category?.category_name,
        instrument_text: params.instrument?.name,
        instrument_size_number: params?.instrument_size,
        company_uuid: params.mandate.company_mandate?.uuid,
        long_term_rating_assgined_text: '',
        short_term_rating_assigned_text: '',
        long_term_outlook_recommendation: GHInput[params?.uuid]?.lt_outlook,
        long_term_outlook: '',
        short_term_outlook: '',
        long_term_rating_recommendation: GHInput[params?.uuid]?.lt_rating_recommendation,
        short_term_rating_recommendation: GHInput[params?.uuid]?.st_rating_recommendation,
        rating_process_uuid:GET_QUERY('rating-uuid'),
        remark: GHInput[params?.uuid]?.remarks,
        agenda: '',
      },
    })
      .then((response) => {
        if (response['success']) {
          setIsSnackbarOpen({ open: true, result: 'success', title: 'Instrument successfully sent to committee for voting' })

          UploadFile(response.rating_committee_meeting_register)
          getInstrumentData()
        }
      })
      .catch((error) => {
        setIsSnackbarOpen({
          open: true,
          result: 'error',
          title: 'Instrument has not been sent to committee, please try again',
        })
      })
  }

  const handleFile = (e, fileType) => {
    const mimetype = e.target.files[0].type
    const size = e.target.files[0].size
    if (fileIsNotValid(mimetype)(size)) return

    setDocument((prev) => {
      return {
        ...prev,
        [fileType]: {
          fileType: fileType,
          fileName: e.target.files[0].name,
          file: e.target.files[0],
        },
      }
    })
  }

  const getMeetings = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings'), { params: { is_active: true, status: 'Upcoming' } })
      .then((data) => {
        const { rating_committee_meetings } = data
        let temp = []
        temp = rating_committee_meetings.map((val) => {
          let time = new Date()
          time.setHours(Number(val.meeting_at.substr(11, 2)))
          time.setMinutes(Number(val.meeting_at.substr(14, 2)))

          return {
            ...val,
            value: val?.uuid,
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
            label: val?.name,
            value: val?.uuid,
          }
        }),
      )
      setCommitteeCategories(...temp)
    })
  }
  useEffect(() => {}, [rows])

  useEffect(() => {
    getInstrumentData()
    fetchRatingCommitteeTypes()
    fetchRatingCommitteeCategories()
    getMeetings()
    SET_PAGE_TITLE('Send to Committee')
    fetchOutlook()
  }, [])

  const getInstrumentData = () => {
    let tempRatingSymbol = {}
    HTTP_CLIENT(APIFY('/v1/group_head/companies'), {
      params: {
        company_uuid: GET_QUERY('company-uuid'),
        code: GET_QUERY('code'),
        rating_process_uuid: GET_QUERY('rating-uuid'),
      },
    })
      .then((insdata) => {
        const { transaction_instruments } = insdata
        setRows(transaction_instruments)
        ;[...transaction_instruments].map(async (insval) => {

          const fetchSymbol = async (val) => {
            await HTTP_CLIENT(APIFY('/v1/rating_symbol_mapping/final_ratings'), {
              params: {
                rating_symbol_category_uuid: insval.instrument.rating_symbol_category?.uuid,
                long_term: val.payload,
              },
            })
              .then((symdata) => {
                const { final_ratings } = symdata

                let arrOptions = [...final_ratings].map((symval) => {
                  return {
                    label: symval?.final_rating,
                    value: symval?.uuid,
                  }
                })
                let key_name = val.key
                let myobj = {}
                myobj[key_name] = arrOptions
                tempRatingSymbol[insval?.uuid] = { ...tempRatingSymbol[insval?.uuid], ...myobj }
              })

              .catch((err) => {})
          }
          ;[
            { key: 'lt', payload: true },
            { key: 'st', payload: false },
          ].forEach(fetchSymbol)
        })
        

        setRatingSymbolOpt(tempRatingSymbol)

        console.log(tempRatingSymbol, 'tempRatingSymbol')
      })
      .catch((err) => {})
  }

  useEffect(() => {
    setFilterMeetingOptions(
      [...MeetingOptions].filter((val) => {
        if (
          SelectedCommitteeCategory.label == val.rating_committee_meeting_category?.name &&
          SelectedCommitteeType.label == val.rating_committee_type?.name
        ) {
          return val
        }
      }),
    )
  }, [SelectedCommitteeCategory, SelectedCommitteeType])

  return (
    <>
      <Box sx={{ zIndex: 1600 }}>
        <ArgonSnackbar
          color={isSnackbarOpen.result}
          icon={isSnackbarOpen.result}
          title={isSnackbarOpen.result}
          content={isSnackbarOpen.title}
          translate="yes"
          dateTime=""
          open={isSnackbarOpen.open}
          close={onCloseSnackbar}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        />
      </Box>
      <DashboardLayout>
        <form>
          <CardWrapper
            headerTitle="Send To Committee"
            footerActionButton={() => {
              return (
                <Box spacing={3} padding="1rem" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#5e72e4 !important', color: 'white !important' }}
                    disabled={
                      SelectedIDs?.length !== 0 &&
                      SelectedCommitteeCategory &&
                      SelectedMeeting &&
                      SelectedCommitteeType &&
                      document['rating_note']?.fileName
                        ? false
                        : true

                      // SelectedCommitteeCategory?.value?.length == 0 &&
                      // SelectedMeeting?.value?.length == 0 &&
                      // SelectedCommitteeType?.value?.length == 0 &&
                      // document['rating_note']?.fileName?.length == 0 &&
                      // document['financial']?.fileName?.length == 0
                    }
                    // onClick={() => {
                    //   Array.from(SelectedIDs).map((val) => {
                    //     if (
                    //       (GHInput[val]?.lt_rating_recommendation?.value?.length > 0 &&
                    //         GHInput[val]?.lt_outlook.value?.length > 0) ||
                    //       GHInput[val]?.st_rating_recommendation?.value?.length > 0
                    //     ) {
                    //       let obj = rows.find((x) => x?.uuid == val)
                    //       saveSendToCommittee(obj)
                    //     } else {
                    //       alert('Kindly fill all the required fields')
                    //     }
                    //   })
                    // }}
                    onClick={() => {
                      let arr = []
                      let myCode = true
                      Array.from(SelectedIDs).map((val) => {
                        if (
                          (GHInput[val]?.lt_rating_recommendation !== undefined && GHInput[val]?.lt_outlook !== undefined) ||
                          GHInput[val]?.st_rating_recommendation !== undefined
                        ) {
                          let obj = rows.find((x) => x?.uuid == val)
                          arr.push(obj)
                        } else {
                          myCode = false
                          return
                        }
                      })
                      if (myCode == true) {
                        arr.map((obj) => saveSendToCommittee(obj))
                        setSelectedIDs([])
                      } else {
                        alert('Kindly fill all the required fields')
                      }
                    }}
                  >
                    Send to Committee
                  </Button>
                </Box>
              )
            }}
          >
            <Grid container xs={12} sx={{ paddingLeft: '20px', paddingRight: '20px' }}>
              <Grid
                container
                xs={12}
                md={9}
                spacing={1}
                sx={{ display: 'flex', flexDirection: 'row', marginBottom: '20px' }}
              >
                <Grid item lg={3.5} sx={{ display: 'flex', flexDirection: 'column', height: 80, paddingLeft: '15px' }}>
                  <Grid item lg={12} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography component="label" variant="caption" fontWeight="bold">
                      Rating Committee Type*
                    </Typography>
                  </Grid>
                  <Grid item xs={3.5} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Autocomplete
                      disablePortal
                      disableClearable
                      value={Object.keys(SelectedCommitteeType)?.length > 0 ? SelectedCommitteeType : null}
                      options={committeeTypeOptions}
                      onChange={(e, val) => {
                        setSelectedCommitteeType(val)
                      }}
                      sx={{ 'width': 220, '&>div': { fontSize: '5px !important' } }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Rating Type"
                          sx={{
                            '&>div': { fontSize: '12px !important', height: '35px !important', width: '235px !important' },
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid item lg={3.5} sx={{ display: 'flex', flexDirection: 'column', height: 80, paddingLeft: '15px' }}>
                  <Grid item lg={12} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography component="label" variant="caption" fontWeight="bold">
                      Rating Committee Category*
                    </Typography>
                  </Grid>
                  <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Autocomplete
                      disablePortal
                      disableClearable
                      value={Object.keys(SelectedCommitteeCategory)?.length > 0 ? SelectedCommitteeCategory : null}
                      options={committeeCategories}
                      onChange={(e, val) => {
                        setSelectedCommitteeCategory(val)
                      }}
                      sx={{ width: 220 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Rating Category"
                          sx={{
                            '&>div': { fontSize: '12px !important', height: '35px !important', width: '235px !important' },
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item lg={3.5} sx={{ display: 'flex', flexDirection: 'column', height: 80, paddingLeft: '15px' }}>
                  <Grid item lg={12} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography component="label" variant="caption" fontWeight="bold">
                      Rating Committee Date and Time*
                    </Typography>
                  </Grid>
                  <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Autocomplete
                      disablePortal
                      disableClearable
                      value={Object.keys(SelectedMeeting)?.length > 0 ? SelectedMeeting : null}
                      options={[...FilterMeetingOptions].sort((a, b) => new Date(b.label) - new Date(a.label))}
                      onChange={(e, value) => {
                        setSelectedMeeting(value)
                      }}
                      sx={{ width: 220 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Committee Date and Time"
                          sx={{
                            '&>div': { fontSize: '12px !important', height: '35px !important', width: '235px !important' },
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid container lg={3} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <input
                    type="file"
                    onChange={(e) => handleFile(e, 'rating_note')}
                    style={{ display: 'none' }}
                    id="uploadRating"
                  />
                  <label htmlFor="uploadRating">
                    <Button component="span" sx={{ width: '140px', fontSize: '13px', padding: 0, color: '#5e72e4' }}>
                      <UploadFileIcon />
                      Upload Rating Note*
                    </Button>
                  </label>
                  <p
                    style={{ fontSize: '11px', paddingTop: '4px', fontStyle: 'italic' }}
               
                  >
                    {document['rating_note']?.fileName}
                  </p>
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex' }}>
                  <div>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFile(e, 'financial')}
                      id="uploadFinancial"
                    />
                    <label htmlFor="uploadFinancial">
                      <Button
                        component="span"
                        sx={{
                          width: '127px',
                          fontSize: '13px',
                          padding: 0,
                          color: '#5e72e4',
                          paddingLeft: '0px !important',
                        }}
                      >
                        <UploadFileIcon />
                        Upload Financials
                      </Button>
                    </label>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', paddingTop: '4px', paddingLeft: '7px', fontStyle: 'italic' }}>
                      {document['financial']?.fileName}
                    </p>
                  </div>
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <input
                    type="file"
                    onChange={(e) => handleFile(e, 'other_document')}
                    style={{ display: 'none' }}
                    id="otherDocs"
                  />
                  <label htmlFor="otherDocs">
                    <Button component="span" sx={{ width: '132px', fontSize: '13px', padding: 0, color: '#5e72e4' }}>
                      <UploadFileIcon />
                      Upload Other Docs
                    </Button>
                  </label>
                  <p style={{ fontSize: '11px', paddingTop: '4px', fontStyle: 'italic' }}>
                    {document['other_document']?.fileName}
                  </p>
                </Grid>
              </Grid>
            </Grid>

            <Grid container>
              <Box
                className="MuiDataGridCssAdjust"
                sx={{ height: 370, width: '95.5%', paddingLeft: '20px', marginBottom: '30px' }}
              >
                <DataGrid
                  rowHeight={50}
                  rows={[...rows]}
                  onCellKeyDown={(params, events) => events.stopPropagation()}
                  disableSelectionOnClick
                  columns={columnsData}
                  hideFooter
                  className="MuiDataGridCssAdjust"
                  components={{
                    NoRowsOverlay: () => (
                      <Stack height="100%" alignItems="center" justifyContent="center">
                        No instrument to send for voting
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
                  sx={{ fontSize: '13px' }}
                  getRowId={(row) => row?.uuid}
                  onSelectionModelChange={(ids) => {
                    dataSelect(ids)
                  }}
                  checkboxSelection
                  selectionModel={SelectedIDs}
                />
              </Box>
              <Grid item lg={4} sx={{ display: 'flex', justifyContent: 'start' }}>
                <Button component="span" sx={{ width: '200px', fontSize: '13px', paddingLeft: '20px', color: '#5e72e4' }}>
                  View previous mandates
                  <KeyboardDoubleArrowRightIcon />
                </Button>
              </Grid>
            </Grid>
          </CardWrapper>
        </form>
      </DashboardLayout>
    </>
  )
}
export default SendToCommittee
