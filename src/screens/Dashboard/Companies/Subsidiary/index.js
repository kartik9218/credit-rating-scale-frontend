import React, { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from 'layouts'
import { ArgonBox } from 'components/ArgonTheme'
import ArgonTypography from 'components/ArgonTypography'
import { Grid, Button, Box } from '@mui/material'
import ArgonSelect from 'components/ArgonSelect'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import DataTable from 'slots/Tables/DataTable'
import { AddOutlined, EditOutlined } from '@mui/icons-material'
import ArgonBadge from 'components/ArgonBadge'
import CardWrapper from 'slots/Cards/CardWrapper'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import EmptyBoxCard from 'slots/Cards/EmptBoxCard'

const Subsidiary = (props) => {
  const navigate = useNavigate()
  const [subsidiariesList, setSubsidiaryList] = useState([])
  const [optionsState, setOptionsState] = useState({
    parentCompanyOptions: [],
    relationshipOptions: [],
  })
  const [filteredSubsidiaries, setFilteredSubsidiaries] = useState([])
  const [params, setParams] = useState({
    parentCompany: { label: 'Select Parent Company...', value: '' },
    relationship: { label: 'Select Relationship...', value: '' },
  })

  const { parentCompanyOptions, relationshipOptions } = optionsState
  const { parentCompany, relationship } = params

  const columns = [
    {
      accessor: 'uuid',
      Header: 'Action',
      Cell: (row) => (
        <Button
          onClick={() =>
            navigate(
              GET_ROUTE_NAME('EDIT_SUBSIDIARY', {
                parentCompany: params['parentCompany']?.label,
                uuid: params['parentCompany']?.value,
              }),
              {
                state: {
                  values: Object.assign(row.row.original, {
                    relationship: getRelationship(row.row.original.type),
                  }),
                },
              },
            )
          }
        >
          <EditOutlined />
        </Button>
      ),
    },
    {
      accessor: 'parent_company',
      Header: 'Parent Company',
      width: '300px',
      Cell: (row) => <>{row.cell.value.name}</>,
    },
    { accessor: 'type', Header: 'Relationship' },
    {
      accessor: 'subsidiary_company',
      Header: 'Company Name',
      width: '350px',
      Cell: (row) => <>{row.cell.value?.name}</>,
    },
    { accessor: 'stake', Header: 'Stake' },
    {
      accessor: 'is_active',
      Header: 'Status',
      Cell: (row) => {
        return (
          <ArgonBadge
            badgeContent={`${row.cell.value ? 'Active' : 'InActive'}`}
            color={`${row.cell.value ? 'success' : 'error'}`}
            container
          />
        )
      },
    },
  ]

  useEffect(() => {
    getAllCompanies()
    getRelationshipOptions()
  }, [])

  useEffect(() => {
    if (!parentCompany?.value) return
    getSubsidiariesList(parentCompany?.value)
  }, [parentCompany?.value])

  useEffect(() => {
    if (!relationship?.value) return
    handleFilterAgainstRelationship()
  }, [relationship.value])

  const getRelationship = (relationship) => {
    return relationshipOptions?.find((option) => option.label === relationship)
  }

  const getSubsidiariesList = (uuid) => {
    HTTP_CLIENT(APIFY('/v1/companies/view_subsidiaries'), { company_uuid: uuid })
      .then((success) => {
        const { subsidiaries } = success
        setSubsidiaryList([...subsidiaries])
        if (!relationship.value) return
        handleFilterAgainstRelationship(subsidiaries)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getRelationshipOptions = () => {
    HTTP_CLIENT(APIFY('/v1/master'), { group: 'company_type' }).then((response) => {
      const { masters } = response
      const options = []
      masters.forEach(({ name, uuid }) => name != 'Parent' && options.push({ label: name, value: uuid }))
      handleSetOptions('relationshipOptions', [...options])
    })
  }

  const getAllCompanies = () => {
    HTTP_CLIENT(APIFY('/v1/companies'))
      .then((response) => {
        const { companies } = response
        const options = []
        companies.forEach(({ name, uuid }) => {
          options.push({ label: name, value: uuid })
        })
        handleSetOptions('parentCompanyOptions', [...options])
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleSetParams = (key, value) => {
    setParams((previous) => {
      return {
        ...previous,
        [key]: value ?? { label: 'Select...', value: '' },
      }
    })
  }

  const handleSetOptions = (key, value) => {
    setOptionsState((previous) => {
      return {
        ...previous,
        [key]: value,
      }
    })
  }

  const handleFilterAgainstRelationship = (data = null) => {
    const oldList = Array.from(data ?? subsidiariesList)
    setFilteredSubsidiaries(() => {
      return oldList.filter((list) => list.type === relationship.label)
    })
  }

  return (
    <DashboardLayout breadcrumbTitle="Subsidiary">
      <CardWrapper
        headerTitle={'Subsidiary'}
        headerActionButton={() => {
          return (
            <HasPermissionButton
              icon={<AddOutlined />}
              permissions={['/dashboard/company/subsidiary/create']}
              text={'Add Subsidiary'}
              route={GET_ROUTE_NAME(
                'ADD_SUBSIDIARY',
                parentCompany?.value === '' ? null : { parentCompany: parentCompany?.label, uuid: parentCompany?.value },
              )}
            />
          )
        }}
      >
        <Box sx={{ margin: '0px 15px 15px 0px' }}>
          <Grid container xs={12} spacing={1} m="0" padding="10px">
            <Grid item xs={3} sm={6} md={6} position="relative">
              <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                Parent Company *
              </ArgonTypography>
              <ArgonSelect
                placeholder="Select Parent Company"
                name="parent_company"
                value={parentCompany}
                onChange={(options) => {
                  handleSetParams('parentCompany', options)
                }}
                options={parentCompanyOptions}
              />
            </Grid>

            <Grid item xs={3} sm={6} md={6} position="relative">
              <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                Relationship *
              </ArgonTypography>
              <Select
                placeholder="Select Relationship"
                name="relationship"
                value={relationship}
                isClearable={true}
                onChange={(options) => {
                  handleSetParams('relationship', options)
                }}
                options={relationshipOptions}
              />
            </Grid>

            <ArgonBox
              sx={{
                height: 'calc(100vh - 50vh)',
                width: '100%',
                marginTop: '40px',
                marginLeft: '20px',
                overflowY: 'scroll',
              }}
            >
              <DataTable
                table={{
                  columns: columns,
                  rows: relationship.value ? filteredSubsidiaries : subsidiariesList,
                }}
                canSearch={true}
                entriesPerPage={false}
              />
            </ArgonBox>
          </Grid>
        </Box>
      </CardWrapper>
    </DashboardLayout>
  )
}

Subsidiary.propTypes = {}

export default Subsidiary
