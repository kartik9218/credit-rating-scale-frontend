import React, { useEffect, useState } from 'react'
import { Add, AddBox, Edit } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { DashboardLayout } from 'layouts'
import { ArgonSnackbar, ArgonBox } from 'components/ArgonTheme'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import DataTable from 'slots/Tables/DataTable'
import ArgonBadge from 'components/ArgonBadge'
import CardWrapper from 'slots/Cards/CardWrapper'
import { Box } from '@mui/system'
import Select from 'react-select'
import { Grid, Typography } from '@mui/material'
import ArgonButton from 'components/ArgonButton'
import { HAS_PERMISSIONS } from 'helpers/Base'

function InteractionQuestionsMaster() {
  var { state } = useLocation()
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [snackbarParams, setSnackbarParams] = useState({
    success: false,
    type: '',
  })
  const [interactionTypes, setInteractionTypes] = useState([])
  const [interactionOptions, setInteractionOptions] = useState([])
  const [interactionType, setInteractionType] = useState({})
  const navigate = useNavigate()
  const handleSuccessState = () => {
    const { success, type } = state
    setSnackbarParams({
      success: success,
      type: type,
    })
    state = null
  }
  const fetchInteractionQuestions = async (e) => {
    HTTP_CLIENT(APIFY('/v1/interactions/view_questions'), {
      params: {
        interaction_type_uuid: interactionType?.value,
      },
    }).then((response) => {
      const interactionQuestion = response['interaction_questions']

      setColumns([
        {
          accessor: 'id',
          Header: 'S. No.',
          width: 10,
          Cell: (row) => {
            return <>{row.cell.value + '.'}</>
          },
        },
        {
          accessor: 'question',
          Header: 'Question',
          Cell: (row) => {
            return (
              <>
                {row.cell.value.name.length === 0 ? (
                  <Typography>No interaction found</Typography>
                ) : (
                  <>
                    {row.cell.value?.name.map((q, key) => {
                      return (
                        <React.Fragment key={key}>
                          <Box>
                            <Typography fontSize="14px">{q}</Typography>
                          </Box>
                        </React.Fragment>
                      )
                    })}
                  </>
                )}
              </>
            )
          },
        },
        {
          accessor: 'question.is_active',
          Header: 'Status',
          Cell: (row) => {
            return (
              <>
                {row.cell.value ? (
                  <>
                    <ArgonBadge badgeContent="Active" color="success" container />
                  </>
                ) : (
                  <>
                    <ArgonBadge badgeContent="Inactive" color="error" container />
                  </>
                )}
              </>
            )
          },
        },
        {
          accessor: 'question.uuid',
          Header: '',
          align: 'right',
          Cell: (row) => {
            return (
              <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
                {/* <HasPermissionButton
                  color="primary"
                  permissions={['/dashboard/company/master/interaction-question/edit']}
                  route={GET_ROUTE_NAME('EDIT_INTERACTION_QUESTION', {
                    uuid: row.cell.value,
                    intUUID: interactionType.value,
                  })}
                  text={`Edit`}
                  icon={<Edit />}
                /> */}
                {HAS_PERMISSIONS(['/dashboard/company/master/interaction-question/edit']) && (
                  <>
                    <ArgonBox paddingRight="10px">
                      <ArgonButton
                        color="primary"
                        onClick={() =>
                          navigate(
                            GET_ROUTE_NAME('EDIT_INTERACTION_QUESTION', {
                              uuid: row.cell.value,
                              intUUID: interactionType.value,
                            }),
                            {
                              state: { interactionType },
                            },
                          )
                        }
                      >
                        <Edit />
                        <ArgonBox margin={'3px'} />
                        Edit
                      </ArgonButton>
                    </ArgonBox>
                  </>
                )}
              </ArgonBox>
            )
          },
        },
      ])
      interactionQuestion.forEach((question, key) => {
        interactionQuestion[key].id = key + 1
      })
      setRows(interactionQuestion)
    })
    setBackdropOpen(false)
  }

  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: '',
    })
  }
  const getInteractionTypes = () => {
    let interactionOptionsArr = []
    HTTP_CLIENT(APIFY('/v1/interaction_type'), { params: { is_active: true } })
      .then((data) => {
        const { interaction_type } = data
        setInteractionTypes(interaction_type)
        data.interaction_type.map((i) => {
          interactionOptionsArr.push({ label: i.name, value: i.uuid })
        })
        setInteractionOptions(interactionOptionsArr)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  useEffect(() => {
    if (state) {
      const { interactionType } = state
      let interactionDetail = interactionType || {}
      setInteractionType(interactionDetail)
    }
  }, [state])

  useEffect(() => {
    SET_PAGE_TITLE(`Manage Interaction Questions`)
    getInteractionTypes()
    let ajaxEvent = true
    // if (ajaxEvent) {
    //   fetchInteractionQuestions();
    //   if (state) {
    //     handleSuccessState();
    //   }
    // }
    if (Object.keys(interactionType).length > 0) {
      fetchInteractionQuestions()
    }

    return () => {
      ajaxEvent = false
    }
  }, [interactionType])

  return (
    <DashboardLayout breadcrumbTitle="Manage Interaction Questions">
      <CardWrapper
        headerTitle="Manage Interaction Questions"
        headerActionButton={() => {
          return (
            <>
              {HAS_PERMISSIONS(['/dashboard/company/master/interaction-question/create']) && (
                <ArgonBox paddingRight="10px">
                  <ArgonButton
                    color={'primary'}
                    onClick={() =>
                      navigate(
                        GET_ROUTE_NAME('ADD_INTERACTION_QUESTION', {
                          intUUID: interactionType.value,
                        }),
                        {
                          state: { interactionType },
                        },
                      )
                    }
                  >
                    <AddBox />
                    <ArgonBox margin={'3px'} />
                    Add
                  </ArgonButton>
                </ArgonBox>
              )}
            </>
          )
        }}
      >
        <Grid mx="0.8rem" container>
          <Grid item xs={2}>
            <Typography>Interaction Type</Typography>
          </Grid>
          <Grid item xs={4}>
            <Select
              placeholder="Select Interaction Type"
              onChange={(options) => {
                setInteractionType(options)
              }}
              options={interactionOptions}
              value={Object.values(interactionType)[0] && interactionType}
            />
          </Grid>
        </Grid>
        {rows.length > 0 ? (
          <DataTable
            table={{
              columns: columns,
              rows: rows,
            }}
          />
        ) : (
          <>
            <Box sx={{ textAlign: 'center', mt: '4rem' }}>
              {Object.keys(interactionType).length > 0 ? (
                <Typography>
                  No Questions Available for this interaction type. Create question by clicking add interaction question
                  button.
                </Typography>
              ) : (
                <Typography>No Questions Available. Select interaction type to view questions.</Typography>
              )}
            </Box>
          </>
        )}
        <ArgonSnackbar
          color={'success'}
          icon="success"
          title={
            snackbarParams.type === 'CREATE'
              ? 'Category Created Successfully'
              : snackbarParams.type === 'UPDATE'
              ? 'Category Updated Successfully'
              : ''
          }
          content=""
          translate="yes"
          dateTime=""
          open={snackbarParams.success}
          close={onCloseSnackbar}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        />
      </CardWrapper>
    </DashboardLayout>
  )
}

export default InteractionQuestionsMaster
