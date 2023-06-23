import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowBackRounded, Edit } from '@mui/icons-material'
import { Autocomplete, Button, Switch, TextField } from '@mui/material'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { GET_QUERY } from 'helpers/Base'
import FormField from 'slots/FormField'
import { DashboardLayout } from 'layouts'
import { ArgonSnackbar, ArgonBox } from 'components/ArgonTheme'
import ArgonButton from 'components/ArgonButton'
import ArgonTypography from 'components/ArgonTypography'
import ArgonSelect from 'components/ArgonSelect'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import DataTable from 'slots/Tables/DataTable'
import ArgonBadge from 'components/ArgonBadge'
import CardWrapper from 'slots/Cards/CardWrapper'
import { ArgonInput } from 'components/ArgonTheme'
import Select from 'react-select'

function InstrumentsEntity() {
  const navigate = useNavigate()
  const uuid = GET_QUERY('uuid')
  const [title, setTitle] = useState(uuid ? 'Edit Instrument' : 'Add Instrument')

  const [instrumentCategories, setInstrumentCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [ratingSymbolCategory, setRatingSymbolCategory] = useState([])
  const [selectedSubCategory, setSelectedSubCategory] = useState({})
  const [selectedInstrumentCategory, setSelectedInstrumentCategory] = useState({})
  const [selectedRatingSymbolCategory, setSelectedRatingSymbolCategory] = useState({})
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [response, setResponse] = useState(null)
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [params, setParams] = useState({
    uuid: uuid,
    name: '',
    short_name: '',
    instrument_category_uuid: '',
    instrument_sub_category_uuid: '',
    rating_symbol_category_uuid: '',
    is_active: '',
  })

  const updateParams = (key, value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return false
    } else {
      setParams((prev) => ({
        ...prev,
        [key]: value,
      }))
    }
  }

  const hendleSelect = (obj) => {
    updateParams('instrument_sub_category_uuid', obj.value)
    setSelectedSubCategory(obj)
  }
  const handleInstrumentCategory = (obj) => {
    updateParams('instrument_category_uuid', obj.value)
    setSelectedInstrumentCategory(obj)
  }
  const handleRatingSymbolCategoryChange = (obj) => {
    updateParams('rating_symbol_category_uuid', obj.value)
    setSelectedRatingSymbolCategory(obj)
  }

  const fetchCategories = async () => {
    setBackdropOpen(true)
    HTTP_CLIENT(APIFY('/v1/categories'), { params: {} }).then((response) => {
      const categories = response['instrument_categories']

      setInstrumentCategories(
        categories.map((category) => {
          return {
            label: category.category_name,
            value: category.uuid,
          }
        }),
      )
    })
    setBackdropOpen(false)
  }

  const fetchData = async () => {
    setBackdropOpen(true)
    HTTP_CLIENT(APIFY('/v1/instruments/view'), {
      params: {
        uuid: uuid,
      },
    }).then((response) => {
      if (response['success']) {
        updateParams('name', response.instrument.name)
        updateParams('short_name', response.instrument.short_name)
        updateParams('is_active', response.instrument.is_active)
        hendleSelect({
          label: response.instrument.instrument_sub_category?.category_name,
          value: response.instrument.instrument_sub_category?.uuid,
        })
        handleRatingSymbolCategoryChange({
          label: response.instrument.rating_symbol_category?.symbol_type_category,
          value: response.instrument.rating_symbol_category?.uuid,
        })
        setSelectedInstrumentCategory({
          label: response.instrument.instrument_category?.category_name,
          value: response.instrument.instrument_category?.uuid,
        })

        return
      }
    })

    setBackdropOpen(false)
  }

  const fetchRatingSymbolCategory = () => {
    setBackdropOpen(true)
    HTTP_CLIENT(APIFY('/v1/rating_symbol_category'), {
      params: {
        is_active: true,
      },
    }).then((response) => {
      const { rating_symbol_category } = response
      setRatingSymbolCategory(
        rating_symbol_category?.map((symbol) => {
          return {
            label: symbol?.symbol_type_category,
            value: symbol?.uuid,
          }
        }),
      )
    })

    setBackdropOpen(false)
  }

  const onFormSubmit = async (ev) => {
    ev.preventDefault()

    let url = uuid ? '/v1/instruments/edit' : '/v1/instruments/create'
    if (!uuid) {
      delete params.uuid
      delete params.is_active
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response['success']) {
          setResponse('success')
          setSnackbarOpen(true)

          navigate(GET_ROUTE_NAME('LIST_INSTRUMENT'), {
            state: { success: true, type: uuid ? 'UPDATE' : 'CREATE' },
          })
          return
        }
      })
      .catch((err) => {
        setResponse('error')
        setSnackbarOpen(true)
      })
  }

  const fetchSubCategory = async (obj) => {
    updateParams('instrument_category_uuid', obj.value)
    setSelectedInstrumentCategory(obj)
    HTTP_CLIENT(APIFY('/v1/sub_categories/by_category/view'), {
      instrument_category_uuid: obj.value,
    }).then((data) => {
      let instrumentSubCategories = data.sub_instrument_category.map((subCategoy) => {
        return {
          label: subCategoy.category_name,
          value: subCategoy.uuid,
        }
      })
      setSubCategories(instrumentSubCategories)
    })
  }

  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  useEffect(() => {
    SET_PAGE_TITLE(title)

    let ajaxEvent = true
    if (ajaxEvent) {
      fetchCategories()
      fetchRatingSymbolCategory()
      if (uuid) {
        fetchData()
      }
    }

    return () => {
      ajaxEvent = false
    }
  }, [])

  return (
    <DashboardLayout breadcrumbTitle={title}>
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle={title}
          headerActionButton={() => {
            return (
              <HasPermissionButton
                color="primary"
                permissions={['/dashboard/company/master/instruments']}
                route={GET_ROUTE_NAME('LIST_INSTRUMENT')}
                text={`Back to Instruments`}
                icon={<ArrowBackRounded />}
              />
            )
          }}
          footerActionButton={() => {
            return (
              <>
                <ArgonBox display="flex" justifyContent="end" spacing={3} marginTop={'18px'} padding="1rem">
                  <ArgonButton type="submit" color="success">
                    {uuid ? 'Update' : 'Submit'}
                  </ArgonButton>
                </ArgonBox>
              </>
            )
          }}
        >
          {!backdropOpen && (
            <Grid container spacing={1} paddingLeft="1rem" paddingRight="1rem">
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Name*
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput
                  type="text"
                  name="name"
                  label="Name*"
                  placeholder="Enter Name "
                  onChange={(ev) => updateParams('name', ev.target.value)}
                  value={params['name']}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Short Name
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput
                  type="text"
                  name="short_name"
                  label="Short Name*"
                  placeholder="Enter Short Name "
                  onChange={(ev) => updateParams('short_name', ev.target.value)}
                  value={params['short_name']}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Category*
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  sx={{ width: '100%', borderRadius: '10px' }}
                  placeholder="Select Category"
                  options={instrumentCategories}
                  value={selectedInstrumentCategory}
                  onChange={fetchSubCategory}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Sub Category*
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  sx={{ width: '100%', borderRadius: '10px' }}
                  placeholder="Select Sub Category"
                  options={subCategories}
                  value={selectedSubCategory}
                  onChange={hendleSelect}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Rating Symbol Category*
                  </ArgonTypography>
                </ArgonBox>

                <Select
                  sx={{ width: '100%', borderRadius: '10px' }}
                  placeholder="Select Rating Symbol Category"
                  options={ratingSymbolCategory}
                  name="rating_symbol_category_uuid"
                  value={
                    Object.values(selectedRatingSymbolCategory)[0] !== undefined ? selectedRatingSymbolCategory : undefined
                  }
                  onChange={handleRatingSymbolCategoryChange}
                />
              </Grid>

              {uuid && (
                <Grid item paddingLeft={3} marginTop={4} xs={12} sm={3} display="flex">
                  <ArgonBox mr={1}>
                    <Switch
                      name="is_active"
                      checked={params['is_active']}
                      onChange={(e) => updateParams('is_active', e.target.checked)}
                    />
                    {params['is_active'] ? '  Active' : '  Inactive'}
                  </ArgonBox>
                </Grid>
              )}
            </Grid>
          )}
        </CardWrapper>
      </ArgonBox>
    </DashboardLayout>
  )
}

export default InstrumentsEntity
