import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { ArrowBackRounded, Edit } from '@mui/icons-material'
import { Button, Switch, Typography } from '@mui/material'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { DashboardLayout } from 'layouts'
import { ArgonSnackbar, ArgonBox } from 'components/ArgonTheme'
import ArgonButton from 'components/ArgonButton'
import ArgonTypography from 'components/ArgonTypography'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import CardWrapper from 'slots/Cards/CardWrapper'
import { ArgonInput } from 'components/ArgonTheme'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { GET_QUERY } from 'helpers/Base'
import Select from 'react-select'
import { HAS_PERMISSIONS } from 'helpers/Base'

function InteractionQuestionEntity() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const uuid = GET_QUERY('uuid')
  const intUUID = GET_QUERY('interaction_uuid')
  const [title, setTitle] = useState(
    uuid
      ? `Edit Interaction Question  ${
          Object.keys(state?.interactionType).length > 0 ? `for ${state?.interactionType.label}` : ''
        }`
      : `Add Interaction Question  ${
          Object.keys(state?.interactionType).length > 0 ? `for ${state?.interactionType.label}` : ''
        }`,
  )
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [response, setResponse] = useState(null)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [interactionTypes, setInteractionTypes] = useState([])
  const [interactionOptions, setInteractionOptions] = useState([])
  const [interactionTypeUUID, setInteractionTypeUUID] = useState('')
  const [backdropOpen, setBackdropOpen] = useState(false)
  console.log(state, 'satte')
  const [params, setParams] = useState({
    uuid: uuid,
    interaction_uuid: '',
    name: '',
    is_active: '',
    question_order: '',
  })

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }))
  }
  const fetchData = async () => {
    setBackdropOpen(true)
    HTTP_CLIENT(APIFY('/v1/interactions/question/view'), {
      params: {
        uuid: uuid,
      },
    }).then((response) => {
      if (response['interaction_question']) {
        updateParams('interaction_uuid', response.interaction_question.interaction_type.uuid)
        updateParams('question_order', response.interaction_question.question_order)
        updateParams('name', response.interaction_question.name)
        updateParams('is_active', response.interaction_question.is_active)
        return
      }
    })
    setBackdropOpen(false)
  }
  const getInteractionTypes = () => {
    let interactionArr = []
    HTTP_CLIENT(APIFY('/v1/interaction_type'), { params: { is_active: true } })
      .then((data) => {
        const { interaction_type } = data
        setInteractionTypes(interaction_type)
        data.interaction_type.map((i) => {
          interactionArr.push({ label: i.name, value: i.uuid })
        })
        setInteractionOptions(interactionArr)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const onFormSubmit = async (ev) => {
    ev.preventDefault()
    let url = uuid ? '/v1/interactions/edit_question' : '/v1/interactions/create_question'
    if (!uuid) {
      delete params.uuid
      delete params.is_active
    }
    if (uuid) {
      HTTP_CLIENT(APIFY(url), {
        params: {
          uuid: uuid,
          interaction_type_uuid: params.interaction_uuid,
          name: [params.name],
          question_order: params.question_order,
          is_active: params.is_active,
        },
      })
        .then((response) => {
          if (response['success']) {
            setResponse('success')
            setSnackbarOpen(true)
            navigate('/dashboard/company/master/interaction-questions', {
              state: state,
            })
            return
          }
        })
        .catch((err) => {
          setResponse('error')
          setSnackbarOpen(true)
        })
    } else {
      HTTP_CLIENT(APIFY(url), {
        params: {
          interaction_type_uuid: intUUID ? intUUID : interactionTypeUUID,
          name: [params.name],
          question_order: params.question_order,
        },
      })
        .then((response) => {
          if (response['success']) {
            setResponse('success')
            setSnackbarOpen(true)
            navigate(GET_ROUTE_NAME('LIST_INTERACTION_QUESTION'), {
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
  }

  const handleInteractionChange = (e) => {
    setInteractionTypeUUID(e.value)
  }
  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  useEffect(() => {
    SET_PAGE_TITLE(title)
    if (uuid) {
      fetchData()
    }
    if (!intUUID || intUUID == 'undefined') {
      getInteractionTypes()
    }
  }, [])

  return (
    <DashboardLayout breadcrumbTitle={title}>
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle={title}
          headerActionButton={() => {
            return (
              <>
                {state?.interactionType !== {} ? (
                  <>
                    {HAS_PERMISSIONS(['/dashboard/company/master/interaction-questions']) && (
                      <>
                        <ArgonBox paddingRight="10px">
                          <ArgonButton
                            color="primary"
                            onClick={() =>
                              navigate('/dashboard/company/master/interaction-questions', {
                                state,
                              })
                            }
                          >
                            <ArrowBackRounded />
                            <ArgonBox margin={'3px'} />
                            Back to Interaction Questions
                          </ArgonButton>
                        </ArgonBox>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <HasPermissionButton
                      color="primary"
                      permissions={['/dashboard/company/master/interaction-questions']}
                      route={GET_ROUTE_NAME('LIST_INTERACTION_QUESTION')}
                      text={`Back to Interaction Questions`}
                      icon={<ArrowBackRounded />}
                    />
                  </>
                )}
              </>
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
            <Grid container spacing={1} paddingLeft="2rem" paddingRight="2rem">
              {(!intUUID || intUUID == 'undefined') && !uuid && (
                <Grid mb={1} display="inline-block" container>
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Interaction Type*
                  </ArgonTypography>
                  <Grid item xs={5.8} mt={0.6}>
                    <Select
                      placeholder="Select Interaction Type"
                      onChange={handleInteractionChange}
                      options={interactionOptions}
                    />
                  </Grid>
                </Grid>
              )}
              <Grid container justifyContent="space-between">
                <Grid xs={5.8}>
                  <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                    <Typography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                      Question Order*
                    </Typography>
                  </ArgonBox>
                  <Grid item xs={12}>
                    <ArgonInput
                      placeholder="Enter Question Order"
                      sx={{ width: '10%' }}
                      type="number"
                      name="name"
                      label="Question Number"
                      onChange={(ev) => updateParams('question_order', ev.target.value)}
                      value={params['question_order']}
                      required
                    />
                  </Grid>
                </Grid>
                <Grid xs={5.8}>
                  <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                    <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                      Interaction Question*
                    </ArgonTypography>
                  </ArgonBox>
                  <ArgonInput
                    type="text"
                    name="name"
                    label="Interaction Question"
                    placeholder="Enter Interaction Question "
                    onChange={(ev) => updateParams('name', ev.target.value)}
                    value={params['name']}
                    required
                  />
                </Grid>
              </Grid>

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

export default InteractionQuestionEntity
