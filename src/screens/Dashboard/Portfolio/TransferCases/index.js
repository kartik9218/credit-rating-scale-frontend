import React, { useCallback, useState, useEffect } from 'react'
import DashboardLayout from 'layouts/DashboardLayout'
import CardWrapper from 'slots/Cards/CardWrapper'
import DataTable from 'react-data-table-component'
import { Box, Grid, Typography } from '@mui/material'
import Select from 'react-select'
import InfomericButton from 'slots/Buttons'
import { ArgonTypography } from 'components/ArgonTheme'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'

const selectStyles = {
  control: (styles) => {
    return {
      ...styles,
      fontSize: '14px',
    }
  },
}
const TransferCases = () => {
  const [data, setData] = useState([
    {
      company_name: 'Adani Ports Sez Ltd',
      mandate_id: '2020-2021/1004',
      rating_head: 'Radhe Mohan',
      group_head: 'Manish Kumar',
      rating_analyst: 'Rohit Mehra',
      uuid: '89012-234789-23498',
    },
  ])
  const [options, setOptions] = useState({
    roles: [],
    userRoles: [],
  })
  const [params, setParams] = useState({
    selectedRole: { label: 'Select Role...', value: '' },
    selectedUser: { label: 'Select User...', value: '' },
    assignee: { label: 'Select Assignee...', value: '' },
  })
  const { selectedRole, selectedUser, assignee } = params

  const columns = [
    {
      name: 'Company Name',
      selector: (row) => row.company_name,
    },
    {
      name: 'Mandate ID',
      selector: (row) => row.mandate_id,
    },
    {
      name: 'Rating Head',
      selector: (row) => row.rating_head,
    },
    {
      name: 'Group Head',
      selector: (row) => row.group_head,
    },
    {
      name: 'Rating Analyst',
      selector: (row) => row.rating_analyst,
    },
    {
      name: 'View History',
      selector: (row) => row.uuid,
      cell: (row) => {
        return (
          <ArgonTypography
            onClick={() => {}}
            sx={{ cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', color: 'blue' }}
          >
            View History
          </ArgonTypography>
        )
      },
    },
  ]

  useEffect(() => {
    getRoles()
  }, [])

  useEffect(() => {
    getUserRoles()
  }, [selectedRole])

  useEffect(() => {
    getMandateCases()
  }, [selectedRole])

  const handleSetValues = (key) => (value) => (type) => {
    const setter = (prev) => Object.assign({}, { ...prev, [key]: value })
    type === 'options' ? setOptions(setter) : setParams(setter)
    if (key === 'selectedRole' && (selectedUser.value || assignee.value)) {
      setParams((previous) => {
        return {
          ...previous,
          selectedUser: { label: 'Select...', value: '' },
          assignee: { label: 'Select...', value: '' },
        }
      })
    }
  }

  const getMandateCases = async () => {
    try {
      const cases = await HTTP_CLIENT(APIFY('/v1/transfer_Cases'), { params: '' })
    } catch (e) {
      console.log(e)
    }
  }

  const getRoles = async () => {
    try {
      const { roles } = await HTTP_CLIENT(APIFY('/v1/roles'), { params: '' })
      handleSetValues('roles')(roles.map((role) => Object.assign({}, { label: role.name, value: role.uuid })))('options')
    } catch (e) {
      console.log(e)
    }
  }

  const getUserRoles = async () => {
    try {
      const {
        role: { users },
      } = await HTTP_CLIENT(APIFY('/v1/roles/view_users'), { role: selectedRole.label })
      handleSetValues('userRoles')(
        users.map((role) =>
          Object.assign({}, { label: `${role.full_name + ' ' + `(${role.employee_code})`}`, value: role.uuid }),
        ),
      )('options')
    } catch (e) {
      console.log(e)
    }
  }

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows)
  }, [])

  return (
    <DashboardLayout>
      <CardWrapper headerTitle={'Transfer Cases'} headerSubtitle={'Transfer Portfolio'}>
        <Grid container padding={'.8rem'} spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', gap: '20px', marginTop: '-10px', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Typography fontSize="16px" fontWeight={500}>
                Choose Role :
              </Typography>
              <Box sx={{ width: '200px' }}>
                <Select
                  styles={selectStyles}
                  value={selectedRole}
                  options={options.roles}
                  onChange={(value) => handleSetValues('selectedRole')(value)('')}
                />
              </Box>
            </Box>

            <Box display={'flex'} gap="10px">
              <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Typography fontSize="16px" fontWeight={500}>
                  from
                </Typography>
                <Box sx={{ width: '200px' }}>
                  <Select
                    styles={selectStyles}
                    value={selectedUser}
                    options={options.userRoles}
                    onChange={(value) => handleSetValues('selectedUser')(value)('')}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Typography fontSize="16px" fontWeight={500}>
                  to
                </Typography>
                <Box sx={{ width: '200px' }}>
                  <Select
                    styles={selectStyles}
                    value={assignee}
                    options={options.userRoles?.filter((roles) => roles.value !== selectedUser.value)}
                    onChange={(value) => handleSetValues('assignee')(value)('')}
                  />
                </Box>
              </Box>
              <InfomericButton onClick={() => {}} color={'primary'}>
                Transfer
              </InfomericButton>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                height: 'calc(100vh - 52vh)',
                width: '100%',
                overflow: 'hidden',
                overflowY: 'scroll',
              }}
            >
              <DataTable
                columns={columns}
                data={data}
                selectableRows
                onSelectedRowsChange={handleRowSelected}
                // clearSelectedRows={toggleCleared}
              />
            </Box>
          </Grid>
        </Grid>
      </CardWrapper>
    </DashboardLayout>
  )
}

export default TransferCases
