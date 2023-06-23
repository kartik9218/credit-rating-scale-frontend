import {
  Autocomplete,
  Button,
  FormControlLabel,
  Input,
  Modal,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material'

import PropTypes from 'prop-types'
import { Box } from '@mui/system'
import colors from 'assets/theme/base/colors'
import { useEffect, useState } from 'react'
import { APIFY } from 'helpers/Api'
import { HTTP_CLIENT } from 'helpers/Api'

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

function TableData({ row, columns, committee_registers, index, idx, ClickedCompany }) {
  const [open, setOpen] = useState(false)
  const [Response, setResponse] = useState(true)
  const [ratingListLT, setRatingListLT] = useState([])
  const [ratingListST, setRatingListST] = useState([])
  const [outlookList, setOutlookList] = useState([])
  const [FormIsComplete, setFormIsComplete] = useState(false)
  const [tempResp, settempResp] = useState(true)
  const [Params, setParams] = useState(row)
  

  useEffect(() => {
    console.log(row)

    const {
      long_term_outlook_recommendation,
      voted_outlook,
      voted_rating,
      short_term_rating_recommendation,
      long_term_rating_recommendation,
    } = Params
    let agree = false
    if (long_term_outlook_recommendation && voted_rating) {
      if (long_term_outlook_recommendation == voted_outlook && voted_rating == long_term_rating_recommendation) agree = true
      else agree = false
    } else if (short_term_rating_recommendation && voted_rating) {
      if (voted_rating == short_term_rating_recommendation) agree = true
      else agree = false
    } else agree = true

    row['vote'] = agree
    row['agree'] = agree
    setParams({ ...Params, agree: row['agree'] })
  }, [])

  const handleOpen = (value) => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }
  // const fetchSymData = (rating_symbol_category_uuid, long_term) => {
  //   HTTP_CLIENT(APIFY('/v1/rating_symbol_mapping'), {
  //     params: { rating_symbol_category_uuid: rating_symbol_category_uuid, long_term: long_term },
  //   }).then((data) => {
  //     let result = data.rating_symbol_mapping.map((val) => {
  //       return {
  //         label: val.final_rating,
  //         value: val?.uuid,
  //       }
  //     })

  //     setRatingList([...result])
  //   })
  // }
  const fetchSymbol = async (val) => {
    await HTTP_CLIENT(APIFY('/v1/rating_symbol_mapping/final_ratings'), {
      params: {
        rating_symbol_category_uuid: Params.rating_symbol_category_uuid,
        long_term: val,
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

        //  let key_name = val.key
        //  let myobj = {}
        //  myobj[key_name] = arrOptions
        //  tempRatingSymbol[insval?.uuid] = { ...tempRatingSymbol[insval?.uuid], ...myobj }
      })

      .catch((err) => {})
  }

  const fetchOutlook = async () => {
    HTTP_CLIENT(APIFY('/v1/outlooks'), { params: {} }).then((response) => {
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

  return (
    <div style={{ display: 'flex', background: 'white', border: '1px solid #eee', padding: '2px' }}>
      <Modal keepMounted open={open} onClose={handleClose}>
        <Box sx={style}>
          {tempResp ? (
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
            <div style={{ flex: 1 }}>Proposed Rating -</div>
            <div style={{ flex: 1, textAlign: 'left' }} className="MuiAutoCompleteCssAdjust">
              <label>{row?.proposedrating}</label>
            </div>
          </div>
          {!tempResp && (
            <>
              {Params.long_term_rating_recommendation && (
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
                      disablePortal
                      options={ratingListLT}
                      sx={{ width: 200 }}
                      onOpen={() => fetchSymbol(true)}
                      value={Params?.voted_rating}
                      onChange={(e, value) => {
                        setParams({ ...Params, voted_rating: value?.label })
                      }}
                      renderInput={(params) => <TextField {...params} placeholder="LT Rating" />}
                    />
                  </div>
                </div>
              )}

              {Params.short_term_rating_recommendation && (
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
                      disablePortal
                      options={ratingListST}
                      onOpen={() => fetchSymbol(false)}
                      sx={{ width: 200 }}
                      onClick={() => {
                        fetchSymbol(false)
                      }}
                      value={Params?.voted_rating}
                      onChange={(e, value) => {
                        setParams({ ...Params, voted_rating: value?.label })
                      }}
                      renderInput={(params) => <TextField {...params} placeholder="ST Rating" />}
                    />
                  </div>
                </div>
              )}
              {Params.is_long_term && (
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
                      value={Params?.voted_outlook}
                      sx={{ width: 200 }}
                      onChange={(e, value) => {
                        setParams({ ...Params, voted_outlook: value?.label })
                      }}
                      renderInput={(params) => <TextField {...params} placeholder="Outlook" />}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          <div style={{ display: 'flex', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>Remarks -</div>
            <div style={{ flex: 1 }}>
              <TextField
                multiline
                rows={5}
                value={Params?.remarks}
                variant="standard"
                onChange={(e) => {
                  setParams({ ...Params, remarks: e.target.value })
                }}
              />
            </div>
          </div>
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
                  if (tempResp) {
                    Params.voted_outlook = Params.long_term_outlook_recommendation
                    Params.voted_rating = Params.long_term_rating_recommendation || Params.short_term_rating_recommendation
                  }
                  setParams({ ...Params, agree: tempResp })
                  committee_registers[index][idx] = { ...Params, agree: tempResp }

                  tempResp == true ? setResponse(true) : setResponse(false)
                  handleClose()
                }}
                disabled={
                  tempResp
                    ? !(Params.remarks?.length > 0)
                    : !(
                        Params.voted_rating?.length >= 0 &&
                        (Params.short_term_rating_recommendation || Params.voted_outlook?.length >= 0) &&
                        Params.remarks?.length > 0
                      )
                }
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
                setParams({ ...Params, remarks: '', outlook: null, voted_rating: null })
                setOpen(false)
                setOpen(true)
                setFormIsComplete(false)
                setBlank(true)
              }}
            >
              Reset
            </Button>

            <div>
              <label
                style={{
                  'textTransform': 'none',
                  'color': 'grey',
                  'padding': '2px 5px',
                  'fontSize': '13px !important',
                  '&:hover': {
                    color: 'black !important',
                  },
                }}
                onClick={() => {
                  // setParams({ ...Params, agree: true })
                  settempResp(Params.agree)
                  setResponse(Params.agree)

                  handleClose()
                }}
              >
                Close
              </label>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Table starts from here */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
        {columns.map((value, i) => {
          value = value.toLowerCase()
          if (value.split(' ')[0] == 'value') value = value.split(' ')[0]
          value = value.replace(' ', '')

          if (value == 'vote') {
            return (
              <div
                key={i + value}
                style={{
                  flex: 2,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '15px',
                  alignItems: 'center',
                  fontWeight: 'normal !important',
                }}
              >
                <RadioGroup
                  className="MUIRadioButtonCSSAdjust"
                  row
                  // value={row ? (row[value] === true ? 'Agree' : row[value] === false ? 'Disagree' : '') : ''}
                  value={Params.agree ? 'Agree' : 'Disagree'}
                  name="radio-buttons-group"
                  sx={{ width: 'fit-content', display: 'flex', justifyContent: 'center', gap: '10px' }}
                >
                  <FormControlLabel
                    value="Agree"
                    // control={<Radio checked={Response && Response != ''} />}
                    control={<Radio checked={Params.agree} />}
                    label="Agree"
                    onClick={(e) => {
                      // setParams({ ...Params, agree: true })
                      settempResp(true)
                      // fetchSymData(Params.rating_symbol_category_uuid, Params.is_long_term)
                      fetchOutlook()
                      handleOpen(e.target.value)
                    }}
                  ></FormControlLabel>
                  <FormControlLabel
                    value="Disagree"
                    // control={<Radio checked={!Response} />}
                    control={<Radio checked={Params.agree === false} />}
                    label="Disagree"
                    onClick={(e) => {
                      // setParams({ ...Params, agree: false })
                      settempResp(false)
                      // fetchSymData(Params.rating_symbol_category_uuid, Params.is_long_term)
                      fetchOutlook()
                      handleOpen(e.target.value)
                    }}
                  />
                </RadioGroup>
              </div>
            )
          }
          if (value == 'remarks') {
            return (
              <div key={i + value} style={{ flex: 1.5, padding: '10px 10px', textAlign: 'center' }}>
                <p>{Params.remarks}</p>
                {/* <Input disabled={true} value={Params.remarks} sx={{ border: 'none' }} placeholder="" /> */}
              </div>
            )
          }
          if (value == 'value') {
            return (
              <div key={i + value} style={{ flex: 1, padding: '10px 10px', textAlign: 'center' }}>
                <p>{Params.value.toFixed(2)}</p>
                {/* <Input disabled={true} value={Params.remarks} sx={{ border: 'none' }} placeholder="" /> */}
              </div>
            )
          }

          if (value == 'dissent') {
            return (
              <div key={i + value} style={{ flex: 1, padding: '10px 10px', textAlign: 'center' }}>
                {Params.dissent !== null ? <p>{Params.dissent?.toString()}</p> : <p>--</p>}
                {/* <Input disabled={true} value={Params.remarks} sx={{ border: 'none' }} placeholder="" /> */}
              </div>
            )
          }

          if (value == 'dissentremark') {
            return (
              <div key={i + value} style={{ flex: 1, padding: '0px 10px', overflow: 'hidden' }}>
                <Input
                  disabled={Params.dissent !== true}
                  value={Params.dissent_remarks}
                  onChange={(e, value) => {
                    setParams({ ...Params, dissent_remarks: e.target.value })
                    committee_registers[index][idx] = { ...Params, dissent_remarks: e.target.value }
                  }}
                  sx={{ border: 'none' }}
                  placeholder=""
                />
                {/* <p>
                  <ul>{Params.dissent_remarks}</ul>
                </p> */}
              </div>
            )
          }

          return (
            row && (
              <div
                key={i + value}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  marginLeft: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {row[value]}
                {/* {value === 'proposedrating' && ' ' + row?.long_term_outlook_recommendation } */}
              </div>
            )
          )
        })}
      </div>
    </div>
  )
}
TableData.propTypes = {
  row: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  committee_registers: PropTypes.arrayOf(PropTypes.object).isRequired,
  index: PropTypes.string.isRequired,
  idx: PropTypes.number.isRequired,
  ClickedCompany: PropTypes.object,
}
export default TableData
