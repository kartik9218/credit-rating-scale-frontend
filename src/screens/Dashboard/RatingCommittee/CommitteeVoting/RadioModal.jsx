import { Autocomplete, Box, Button, Modal, TextField, Typography } from '@mui/material'
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import colors from 'assets/theme/base/colors'
import { useState } from 'react'
import { useEffect } from 'react'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'

function RadioModal({
  RowModalParams,
  OpenRadioModal,
  setOpenRadioModal,
  setRowModalParams,
  setResponse,
  Rows,
  setRows,
  AgreeRemark,
  DisagreeRemark,
  DissentRemark,
  setAgreeRemark,
  setDisagreeRemark,
  setDissentRemark,
}) {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',

    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    fontSize: '14px',
    alignItems: 'center',
  }
  const [ratingListLT, setRatingListLT] = useState([])
  const [ratingListST, setRatingListST] = useState([])
  const [outlookList, setOutlookList] = useState([])

  const [SelectedST, setSelectedST] = useState({ label: '', value: '' })
  const [SelectedLT, setSelectedLT] = useState({ label: '', value: '' })
  const [SelectedOutlook, setSelectedOutlook] = useState({ label: '', value: '' })

  const fetchOutlook = async () => {
    HTTP_CLIENT(APIFY('/v1/outlooks'), { params: { is_active: true } }).then((response) => {
      const { outlooks } = response
      let temp = []
      temp = outlooks.map((val) => {
        return {
          label: val?.name,
          value: val?.uuid,
        }
      })
      setOutlookList([...temp])
    })
  }
  const handleClose = () => {
    setOpenRadioModal(false)
  }

  const [SaveButtonState, setSaveButtonState] = useState(true)

  useEffect(() => {
    let SaveDisabled =
      RowModalParams.temp_response && AgreeRemark
        ? false
        : RowModalParams.is_long_term &&
          RowModalParams.is_short_term &&
          RowModalParams.temp_response == false &&
          DisagreeRemark &&
          SelectedLT?.label &&
          SelectedST?.label &&
          SelectedOutlook?.label
        ? false
        : RowModalParams.is_long_term &&
          RowModalParams.temp_response == false &&
          DisagreeRemark &&
          SelectedLT?.label &&
          SelectedOutlook?.label
        ? false
        : RowModalParams.is_short_term && RowModalParams.temp_response == false && DisagreeRemark && SelectedST?.label
        ? false
        : true
    setSaveButtonState(SaveDisabled)
  }, [SelectedLT, SelectedST, SelectedOutlook, AgreeRemark, DisagreeRemark])

  const fetchSymbol = async (val) => {
    await HTTP_CLIENT(APIFY('/v1/rating_symbol_mapping/final_ratings'), {
      params: {
        rating_symbol_category_uuid: RowModalParams.rating_symbol_category_uuid,
        long_term: val,
        is_active: true,
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
        val ? setRatingListLT(arrOptions) : setRatingListST(arrOptions)
      })

      .catch((err) => {})
  }

  useEffect(() => {
    fetchOutlook()
  }, [])

  // Setting Initial values only
  const handleSetModalData = () => {
    console.log(RowModalParams,"check3");
    let myLT = RowModalParams?.is_long_term
      ? RowModalParams?.voted_rating?.split('/').length > 1
        ? { label: RowModalParams?.voted_rating?.split('/')[0], value: '' }
        : { label: RowModalParams?.voted_rating, value: '' }
      : { label: '', value: '' }
    setSelectedLT(myLT)

    let myST = RowModalParams.is_short_term
      ? RowModalParams?.voted_rating?.split('/').length > 1
        ? { label: RowModalParams?.voted_rating?.split('/')[1], value: '' }
        : { label: RowModalParams?.voted_rating, value: '' }
      : { label: '', value: '' }

    setSelectedST(myST)
    let myOutlook = { label: RowModalParams?.voted_outlook, value: '' }
    setSelectedOutlook(myOutlook)
  }
  useEffect(() => {
    if (Object.keys(RowModalParams).length > 0) {
      handleSetModalData()
    }
  }, [RowModalParams])

  return (
    <Modal keepMounted open={OpenRadioModal} onClose={handleClose}>
      <Box sx={style}>
        {RowModalParams.temp_response ? (
          <Typography variant="h5" component="h5">
            Agree with Proposed Rating
          </Typography>
        ) : (
          <Typography variant="h5" component="h5">
            Disagree with Proposed Rating
          </Typography>
        )}
        <hr style={{ color: '#ccc', height: '1px', background: '#ccc', border: 'none' }} />
        <div style={{ display: 'flex', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }} onClick={() => console.log(SelectedOutlook)}>
            Proposed Rating -
          </div>
          <div style={{ flex: 1, textAlign: 'left' }} className="MuiAutoCompleteCssAdjust">
            <label>{RowModalParams.display_proposed_rating}</label>
          </div>
        </div>
        {!RowModalParams.temp_response && (
          <>
            {RowModalParams.is_long_term && (
              <div
                style={{
                  display: 'flex',
                  width: '90%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>Assigned LT Rating -</div>
                <div style={{ flex: 1, textAlign: 'center' }} className="MuiAutoCompleteCssAdjust">
                  <Autocomplete
                    disableClearable
                    disablePortal
                    options={ratingListLT}
                    sx={{ width: 200 }}
                    onOpen={() => fetchSymbol(true)}
                    value={SelectedLT?.label}
                    onChange={(e, value) => {
                      setSelectedLT(value)
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="LT Rating" />}
                  />
                </div>
              </div>
            )}

            {RowModalParams.is_short_term && (
              <div
                style={{
                  display: 'flex',
                  width: '90%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>Assigned ST Rating -</div>
                <div style={{ flex: 1, textAlign: 'center' }} className="MuiAutoCompleteCssAdjust">
                  <Autocomplete
                    options={ratingListST}
                    onOpen={() => fetchSymbol(false)}
                    sx={{ width: 200 }}
                    onClick={() => {
                      fetchSymbol(false)
                    }}
                    value={SelectedST?.label}
                    onChange={(e, value) => {
                      setSelectedST(value)
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="ST Rating" />}
                  />
                </div>
              </div>
            )}
            {RowModalParams.is_long_term && (
              <div
                style={{
                  display: 'flex',
                  width: '90%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>Assigned LT Outlook -</div>
                <div style={{ flex: 1, textAlign: 'center' }} className="MuiAutoCompleteCssAdjust">
                  <Autocomplete
                    disablePortal
                    options={outlookList}
                    value={SelectedOutlook?.label}
                    sx={{ width: 200 }}
                    onChange={(e, value) => {
                      setSelectedOutlook(value)
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Outlook" />}
                  />
                </div>
              </div>
            )}
          </>
        )}
        {RowModalParams.temp_response == true ? (
          <div style={{ display: 'flex', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>Agree Remarks -</div>
            <div style={{ flex: 1 }}>
              <TextField
                multiline
                rows={5}
                value={AgreeRemark}
                variant="standard"
                onChange={(e) => {
                  setAgreeRemark(e.target.value)
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>Disagree Remarks -</div>
            <div style={{ flex: 1 }}>
              <TextField
                multiline
                rows={5}
                value={DisagreeRemark}
                variant="standard"
                onChange={(e) => {
                  setDisagreeRemark(e.target.value)
                }}
              />
            </div>
          </div>
        )}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '50px',
            justifyContent: 'center',
          }}
        >
          <div>
            <Button
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
              onClick={() => {
                let myObj = {}

                if (RowModalParams.temp_response) {
                  if (RowModalParams.is_long_term) {
                    myObj.voted_outlook = RowModalParams.long_term_outlook_recommendation
                    myObj.voted_rating = RowModalParams.is_short_term
                      ? `${RowModalParams.long_term_rating_recommendation}/${RowModalParams.short_term_rating_recommendation}`
                      : RowModalParams.long_term_rating_recommendation
                  } else myObj.voted_rating = RowModalParams.short_term_rating_recommendation
                } else {
                  if (RowModalParams.is_long_term) {
                    myObj.voted_outlook = SelectedOutlook?.label
                    myObj.voted_rating = RowModalParams.is_short_term
                      ? `${SelectedLT?.label}/${SelectedST?.label}`
                      : SelectedLT?.label
                  } else myObj.voted_rating = SelectedST?.label
                }

                myObj.display_assigned_rating =
                  RowModalParams.is_long_term && RowModalParams.is_short_term
                    ? `${myObj.voted_rating.split('/')[0]}(${myObj.voted_outlook})/${myObj.voted_rating.split('/')[1]}`
                    : RowModalParams.is_long_term
                    ? `${myObj.voted_rating}(${myObj.voted_outlook})`
                    : `${myObj.voted_rating}`

                myObj.final_response = (RowModalParams.display_proposed_rating ==  myObj.display_assigned_rating)
                myObj.remarks = myObj.final_response ? AgreeRemark : DisagreeRemark

                console.log(myObj,'myObj')
                let idx = Rows.findIndex((val) => val.instrument_detail_uuid === RowModalParams.instrument_detail_uuid)
                if (idx >= 0) {
                  //   console.log(Rows[idx], 'Row')
                  Rows[idx] = { ...Rows[idx], ...myObj }
                  // Rows[idx]=Object.assign(Rows,myObj)
                  setRows([...Rows])
                  //   console.log(Rows[idx], 'updatedRow')
                  handleClose()
                }
              }}
              disabled={SaveButtonState}
            >
              Save
            </Button>
          </div>

          <Button
            variant="outlined"
            sx={{
              'textTransform': 'none',
              'color': 'grey',
              'border': '1px solid grey',
              'padding': '2px 15px',
              'fontSize': '13px !important',
              '&:hover': {
                color: 'black !important',
              },
            }}
            onClick={() => {
              setSelectedLT({ label: '', value: '' })
              setSelectedST({ label: '', value: '' })
              setSelectedOutlook({ label: '', value: '' })
              RowModalParams.temp_response ? setAgreeRemark('') : setDisagreeRemark('')
            }}
          >
            Reset
          </Button>

          <Button
            variant="outlined"
            sx={{
              'textTransform': 'none',
              'color': 'grey',
              'border': '1px solid grey',
              'padding': '2px 15px',
              'fontSize': '13px !important',
              '&:hover': {
                color: 'black !important',
              },
            }}
            onClick={() => {
              handleClose()
            }}
          >
            Close
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

export default RadioModal
RadioModal.propTypes = {
  Rows: PropTypes.arrayOf(PropTypes.object),
  setRows: PropTypes.func,
  OpenRadioModal: PropTypes.bool,
  setOpenRadioModal: PropTypes.func,
  setRowModalParams: PropTypes.func,
  setResponse: PropTypes.func,
  RowModalParams: PropTypes.object,
  AgreeRemark: PropTypes.string,
  DisagreeRemark: PropTypes.string,
  DissentRemark: PropTypes.string,
  setAgreeRemark: PropTypes.func,
  setDisagreeRemark: PropTypes.func,
  setDissentRemark: PropTypes.func,
}
