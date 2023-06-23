import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Input,
  TextField,
  Typography,
} from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { Form, Formik, Field, ErrorMessage, FieldArray } from 'formik'
import PropTypes, { object } from 'prop-types'
import ArgonSelect from 'components/ArgonSelect'
import moment from 'moment/moment'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import dayjs from 'dayjs'

const RatingCommitteeSchedule = ({
  getMeetings,
  open,
  setOpen,
  setIsSnackbarOpen,
  ClickedObj,
  setClickedObj,
  AddOrEdit,
  setAddOrEdit,
}) => {
  const [dateVal, setDateVal] = useState(dayjs(moment(new Date()).format('YYYY-MM-DD')))
  const [committeeTypeOptions, setcommitteeTypeOptions] = useState([])
  const [committeeCategories, setcommitteeCategories] = useState([])
  const [formikDataInitVal, setformikDataInitVal] = useState({})
  function disableWeekends(date) {
    return date.day() === 0 || date.day() === 6
  }

  const fetchRatingCommitteeTypes = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_types'), { params: { is_active: true } }).then((response) => {
      const rating_committee_types = response['rating_committees']
      let temp = []
      temp.push(
        rating_committee_types.map((val) => {
          return {
            ...val,
            label: val.name,
            value: val.uuid,
          }
        }),
      )
   
      setcommitteeTypeOptions(...temp)
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
            name: val.name,
            value: val.uuid,
            uuid: val.uuid,
          }
        }),
      )
      setcommitteeCategories(...temp)
    })
  }

  const saveMeeting = async (params) => {
    let url = '/v1/rating_committee_meetings/create'
    let myTitle = 'Meeting Scheduled Successfully'

    if (AddOrEdit == 'edit') {
      myTitle = 'Meeting Rescheduled Successfully'
      params = { ...params, uuid: ClickedObj.uuid }
      url = '/v1/rating_committee_meetings/edit'
    }
    HTTP_CLIENT(APIFY(url), {
      params,
    }).then((response) => {
      if (response['success']) {
        getMeetings()
        formik.resetForm()
        setIsSnackbarOpen({ open: true, result: 'success', title: myTitle })

        return
      } else {
        formik.resetForm()
        setIsSnackbarOpen({ open: true, result: 'error', title: 'Unable to Schedule Meeting' })
      }
    })
  }

  useEffect(() => {
    fetchRatingCommitteeTypes()
    fetchRatingCommitteeCategories()
    if (AddOrEdit === 'edit') {
  
      setformikDataInitVal({
        timeVal: dayjs(new Date(ClickedObj.meeting_at.substr(0, 16))),
        dateVal: dayjs(moment(ClickedObj.meeting_at.substr(0, 10))),
        rating_committee_type: ClickedObj.rating_committee_type,
        rating_committee_category: ClickedObj.rating_committee_meeting_category,
      })
    }

    if (AddOrEdit === 'add') {
      setformikDataInitVal({
        timeVal: new Date(new Date().getTime()),
        dateVal: dayjs(moment(new Date()).format('YYYY-MM-DD')),
        rating_committee_type: {},
        rating_committee_category: {},
      })
    }
  }, [ClickedObj])

  const formik = useFormik({
    initialValues: {
      timeVal:
        AddOrEdit == 'add'
          ? new Date(new Date().getTime())
          : new Date(new Date(ClickedObj.meeting_at).getTime() - 330 * 60000),
      dateVal: ClickedObj.meeting_at,
      rating_committee_type: ClickedObj.rating_committee_type,
      rating_committee_category: ClickedObj.rating_committee_meeting_category,
    },
    validationSchema: yup.object().shape({
      rating_committee_type: yup.object().required(),
      rating_committee_category: yup.object().required(),
    }),
    onSubmit: (values) => {
 
      values.dateVal = moment(values.dateVal)
      values.timeVal = moment(values.timeVal)


      let currentTime = new Date(
        dateVal.format('YYYY'),
        Number(values.dateVal.format('MM')) - 1,
        values.dateVal.format('DD'),
        values.timeVal.format('HH'),
        values.timeVal.format('mm'),
        values.timeVal.format('ss'),
      )
      currentTime.setHours(currentTime.getHours() + 5)
      currentTime.setMinutes(currentTime.getMinutes() + 30)

      saveMeeting({
        rating_committee_type_uuid: values.rating_committee_type.uuid,
        rating_committee_meeting_category_uuid: values.rating_committee_category.uuid,
        meeting_at: currentTime,
      })
      setOpen(false)
      getMeetings()
    },
  })

  return (
    <>
      {open && (Object.keys(ClickedObj).length > 0 || AddOrEdit === 'add') && (
        <Dialog
          disableEscapeKeyDown
          fullWidth
          maxWidth="lg"
          sx={{
            'zIndex': '1200',
            '.css-366w5h-MuiPaper-root-MuiDialog-paper': {
              padding: '1rem',
            },
          }}
          open={open}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle sx={{ textAlign: 'left' }}>Rating Committee Meeting Schedule</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <Box sx={{ width: '45%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      my: '0.8rem',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: '14px' }}>Rating Committee Type</Typography>
                    <Grid item xs={5}>
                      <ArgonSelect
                        name="rating_committee_type"
                        options={committeeTypeOptions}
                        value={formik.values.rating_committee_type}
                        onChange={(value) => {
                          
                          formik.setFieldValue('rating_committee_type', value)
                        }}
                      />
                      {formik.touched.rating_committee_type && (
                        <p style={{ color: 'red', fontSize: '11px' }}>{formik.errors.rating_committee_type}</p>
                      )}
                    </Grid>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      my: '0.8rem',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: '14px' }}>Rating Committee Date</Typography>
                    <Grid item xs={5}>
                     
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                          disablePast
                          inputFormat="YYYY-MM-DD"
                          className={'date-picker-width datepicker'}
                          name="dateVal"
                          value={formik.values.dateVal}
                          shouldDisableDate={disableWeekends}
                          onChange={(newValue) => {
                            const diffTime = Math.abs(newValue - new Date())
                            const diffDays = Math.abs(diffTime / (1000 * 60 * 60 * 24))
                            
                            if (diffDays<0.01) {
                              let res = confirm(
                                'Cannot schedule meeting for past time, so, current time will be set as meeting time. Proceed?',
                              )
                              if (!res) {
                                return
                              }
                              formik.setFieldValue('timeVal', new Date())
                              formik.setFieldValue('dateVal', newValue)

                              return
                            }
                            formik.setFieldValue('dateVal', newValue)

                            newValue = moment(newValue)

                            let currentTime = new Date(
                              newValue.format('YYYY'),
                              Number(newValue.format('MM')) - 1,
                              newValue.format('DD'),
                              moment(formik.values.timeVal).format('HH'),
                              moment(formik.values.timeVal).format('mm'),
                              moment(formik.values.timeVal).format('ss'),
                            )
                           
                            formik.setFieldValue('timeVal', currentTime)
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              sx={{
                                '.MuiOutlinedInput-root': {
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  paddingLeft: '0px',
                                  borderRadius: '2px',
                                },
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      my: '0.8rem',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: '14px' }}>Rating Committee Time</Typography>
                    <Grid item xs={5}>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <TimePicker
                          name="timeVal"
                          disablePast
                          value={formik.values.timeVal}
                          onChange={(newValue) => {

                            if (new Date(newValue) >= new Date()) formik.setFieldValue('timeVal', newValue)
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              sx={{
                                'width': '180px',
                                '&>div': { paddingLeft: '0px !important' },
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Box>
                </Box>
                <Box sx={{ width: '45%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      my: '0.8rem',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: '14px' }}>Rating Committee Category</Typography>
                    <Grid item xs={5}>
                      <ArgonSelect
                        name="rating_committee_category"
                        options={committeeCategories}
                        value={formik.values.rating_committee_category}
                        onChange={(value) => {
                          formik.setFieldValue('rating_committee_category', value)
                        }}
                      />
                      {formik.touched.rating_committee_category && (
                        <p style={{ color: 'red', fontSize: '11px' }}>{formik.errors.rating_committee_category}</p>
                      )}
                    </Grid>
                  </Box>
                </Box>
              </Box>

              <hr
                style={{
                  backgroundColor: 'lightgray',
                  marginTop: '50px',
                  border: 'none',
                  height: '1px',
                  color: 'gray',
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                sx={{
                  'border': '1px solid rgba(211, 47, 47, 0.5)',
                  'color': '#d32f2f',
                  'background': 'none',
                  '&:hover': {
                    color: '#d32f2f',
                    background: 'none',
                  },
                }}
                onClick={() => {
                  setOpen(false)
                  formik.resetForm()
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                type="submit"
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
             
              >
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </>
  )
}

export default RatingCommitteeSchedule

RatingCommitteeSchedule.propTypes = {
  getMeetings: PropTypes.PropTypes.func,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  setIsSnackbarOpen: PropTypes.func,
  ClickedObj: PropTypes.object,
  setClickedObj: PropTypes.func,
  AddOrEdit: PropTypes.string,
  setAddOrEdit: PropTypes.func,
}
