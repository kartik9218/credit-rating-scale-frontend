import { AddBox } from '@mui/icons-material'
import { Autocomplete, Box, Button, ButtonGroup, Chip, Grid, Stack, TextField, Tooltip, Typography } from '@mui/material'
import DashboardLayout from 'layouts/DashboardLayout'
import React, { useEffect, useState } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { DataGrid } from '@mui/x-data-grid'
import '../../../../styles/index.css'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { SET_PAGE_TITLE } from 'helpers/Base'
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'
import moment from 'moment/moment'
import { useLocation, useNavigate } from 'react-router-dom'
import { HAS_PERMISSIONS } from 'helpers/Base'
import ArgonBox from 'components/ArgonBox'
import ArgonButton from 'components/ArgonButton'
import Select from 'react-select'
import ArgonSnackbar from 'components/ArgonSnackbar'

function DueDiligenceView() {
  const [activeOption, setActiveOption] = useState({})
  const [gridRows, setGridRows] = useState([])
  const [ButtonInteractionTypeNames, setButtonInteractionTypeNames] = useState([])
  const [Companies, setCompanies] = useState([])
  const [SelectedCompany, setSelectedCompany] = useState({})
  const navigate = useNavigate()
  let { state } = useLocation()

  const [snackbarParams, setSnackbarParams] = useState({
    success: false,
    type: '',
  })

  const handleSuccessState = () => {
    const { success, type } = state
    setSnackbarParams({
      success: success,
      type: type,
    })
    state = null
  }
  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: '',
    })
  }
  const defaultCol = [
    {
      field: 'created_at',
      headerName: 'Initiated on',
      renderCell: (params) => {
        return <label>{moment(params.row.time_of_interaction).format('DD-MM-YYYY')}</label>
      },
      flex: 1,
    },
    {
      field: 'time_of_interaction',
      headerName: 'Time',
      flex: 1,
      renderCell: (params) => {
        return (
          <>
            <label>
              {params.row.time_of_interaction &&
                new Date(params.row.time_of_interaction).toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })}
            </label>
          </>
        )
      },
    },
    {
      field: 'contact_person',
      headerName: 'Contact Person',
      flex: 5,
      renderCell: (params) => {
        return (
          <div>
            {params.row.contact_person &&
              JSON.parse(params.row.contact_person).map((val, idx) => {
                if (idx === 0)
                  return (
                    <label style={{ lineHeight: '8px' }} key={'cp' + idx}>
                      {val.label}{' '}
                    </label>
                  )
                else
                  return (
                    <label style={{ lineHeight: '8px' }} key={'cp' + idx}>
                      , {val.label}{' '}
                    </label>
                  )
              })}
          </div>
        )
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 2,
      headerAlign: 'center',
      renderCell: (cell) => {
        return (
          <>
            <Box sx={{ py: '6px', margin: 'auto' }}>
              <HasPermissionButton
                color="primary"
                permissions={['/dashboard/due-diligence']}
                route={GET_ROUTE_NAME('VIEW_DILIGENCE', { operation: 'view', uuid: cell.row.uuid })}
                text={`View`}
                icon={<RemoveRedEyeOutlinedIcon />}
              />
            </Box>
            <HasPermissionButton
              color="primary"
              permissions={['/dashboard/due-diligence']}
              route={GET_ROUTE_NAME('EDIT_DILIGENCE', { operation: 'edit', uuid: cell.row.uuid })}
              text={`Edit`}
              icon={<CreateOutlinedIcon />}
            />
          </>
        )
      },
    },
  ]
  const columns = {
    Banker: [...defaultCol],
    Auditor: [...defaultCol],
    IPATrustee: [...defaultCol],
  }
  const [gridColumn, setGridColumn] = useState([...columns.Banker])
  const fetchCompanyData = () => {
    HTTP_CLIENT(APIFY('/v1/companies/based_on_roles'), { params: { user_uuid: '', role_uuid: '' } }).then((data) => {
      let result = data.companies.map((company) => {
        return {
          label: company.company_name,
          value: company.company_uuid,
          // industry: company.company_industry,
          // subIndustry: company.company_sub_industry,
        }
      })
      setCompanies(result)
    })
  }
  const fetchDiligenceData = () => {
    HTTP_CLIENT(APIFY('/v1/due_diligences/view'), {
      params: {
        interaction_type_uuid: activeOption.uuid,
        company_uuid: SelectedCompany.value,
      },
    })
      .then((data) => {
        let { due_diligence } = data
        if (due_diligence == null) {
          setGridRows([])
          return
        }
        due_diligence = due_diligence.map((val, idx) => {
          val.id = idx + 1
          val.companyName = val.company.name
          return val
        })
        setGridRows([...due_diligence])
      })
      .catch((err) => {
        console.log(err)
      })
  }
  const getButtonInteractionTypeNames = () => {
    HTTP_CLIENT(APIFY('/v1/company/interaction_types '), { params: { company_uuid: SelectedCompany.value } }).then(
      (data) => {
        const { company_interactions } = data
        const myarr = []
        company_interactions.map((item) => {
          const { uuid, interaction_types } = item
          myarr.push({ uuid, interaction_types })
        })
        setButtonInteractionTypeNames([...myarr])
        setActiveOption(myarr[0])
      },
    )
  }

  console.log(state, 'st')

  useEffect(() => {
    if (state) {
      let companyDetail = state?.companyAndInteractionData?.companyData || {}
      setSelectedCompany(companyDetail)
      handleSuccessState()
    }
  }, [state])

  useEffect(() => {
    SET_PAGE_TITLE('Due Diligence List')
    fetchCompanyData()
    if (SelectedCompany?.label) {
      getButtonInteractionTypeNames()
    }
    return setButtonInteractionTypeNames([])
  }, [SelectedCompany])

  useEffect(() => {
    if (SelectedCompany?.value?.length > 0 && activeOption?.uuid?.length > 0) fetchDiligenceData()
    return setGridRows([])
  }, [SelectedCompany, activeOption])

  return (
    <>
      <DashboardLayout>
        <CardWrapper
          headerTitle="Due Diligence List"
          headerActionButton={() => {
            return (
              <>
                {/* <HasPermissionButton
                  color="primary"
                  permissions={['/dashboard/due-diligence/create']}
                  route={GET_ROUTE_NAME('ADD_DILIGENCE')}
                  text={`Add`}
                  icon={<AddBox />}
                /> */}
                {HAS_PERMISSIONS(['/dashboard/due-diligence/create']) && (
                  <ArgonBox paddingRight="10px">
                    <ArgonButton
                      color={'primary'}
                      onClick={() =>
                        navigate('/dashboard/due-diligence/create', {
                          state: { companyData: SelectedCompany },
                        })
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
          <Box>
            <Grid container width="50%" alignItems="center" pl="2rem">
              <Grid item xs={3}>
                <Typography component="label" variant="caption" sx={{ fontSize: '14px' }}>
                  Select Company
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Select
                  isClearable={true}
                  options={Companies}
                  value={SelectedCompany?.value && SelectedCompany}
                  onChange={(options) => {
                    setSelectedCompany(options)
                  }}
                  placeholder="Select Company..."
                />
              </Grid>
            </Grid>
          </Box>
          {SelectedCompany?.label && (
            <Box
              sx={{
                justifyContent: 'space-around',
                display: 'flex',
                height: 'fit-content',
                padding: '11px',
                overflowX: 'auto',
                flexWrap: 'wrap',
              }}
            >
              {ButtonInteractionTypeNames.map((val, key) => {
                return (
                  <Box
                    id={key}
                    key={key}
                    onClick={(e) => {
                      if (columns[val.interaction_types.replace(' ', '')] == undefined) {
                        setGridColumn([...defaultCol])
                      } else setGridColumn([...columns[val.interaction_types.replace(' ', '')]])
                      setActiveOption(val)
                    }}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: val.interaction_types == activeOption?.interaction_types ? '#5e72e4' : '#ebebeb',
                      color:
                        val.interaction_types == activeOption?.interaction_types
                          ? 'white !important'
                          : 'dark-grey  !important',
                      fontWeight: '700',
                      fontSize: '14px',
                      width: '130px !important',
                      height: '33px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '5px',
                      margin: '10px',
                    }}
                  >
                    {val.interaction_types}
                  </Box>
                )
              })}
            </Box>
          )}
          {SelectedCompany?.label && (
            <Box sx={{ height: 450, width: '95%', margin: '20px 30px' }} className="Diligence-data-grid">
              <DataGrid
                disableSelectionOnClick
                getRowHeight={() => 'auto'}
                columnVisibilityModel={activeOption?.interaction_types === 'Plant Visit' && { time_of_interaction: false }}
                components={{
                  NoRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                      No due diligence to show. Create due diligence by clicking add button.
                    </Stack>
                  ),
                }}
                sx={{ fontSize: '13px' }}
                getRowId={(row) => row.uuid}
                rows={gridRows}
                columns={gridColumn}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'created_at', sort: 'desc' }],
                  },
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[10]}
              />
            </Box>
          )}

          <ArgonSnackbar
            color={'success'}
            icon="success"
            title={
              snackbarParams.type === 'CREATE'
                ? 'Due Diligence Created Successfully'
                : snackbarParams.type === 'UPDATE'
                ? 'Due Diligence Updated Successfully'
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
    </>
  )
}

export default DueDiligenceView
