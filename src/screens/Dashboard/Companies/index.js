import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Grid, Modal, Box, IconButton, Tooltip } from '@mui/material'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { APIFY, HTTP_CLIENT } from 'helpers/Api'
import { DashboardLayout } from 'layouts'
import { ArgonBox, ArgonButton } from 'components/ArgonTheme'
import { AddBox, EditOutlined } from '@mui/icons-material'
import DataTable from 'slots/Tables/DataTable'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import CardWrapper from 'slots/Cards/CardWrapper'

function Companies() {
  const navigate = useNavigate()
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])

  const fetchData = () => {
    HTTP_CLIENT(APIFY('/v1/companies'), {}).then((data) => {
      setColumns([
        {
          accessor: 'name',
          Header: 'Name',
          width: '90',
          Cell: (row) => {
            return (
              <Tooltip title={'view company details'}>
                <ArgonBox
                  component={Link}
                  to={GET_ROUTE_NAME('VIEW_COMPANY', {
                    uuid: row['cell']['row']['original']['uuid'],
                  })}
                >
                  <span className="hover-effect">{row.cell.value}</span>
                </ArgonBox>
              </Tooltip>
            )
          },
        },
        {
          accessor: 'type',
          Header: 'Company Type',
          width: '80',
          Cell: (row) => <>{row.cell.value || '-'}</>,
        },
        { accessor: 'short_code', Header: 'Short Code' },
        {
          accessor: 'uuid',
          Header: 'Action',
          Cell: (row) => {
            return (
              <div>
                <ArgonButton
                  sx={{ color: 'white !important', display: 'flex', gap: '6px' }}
                  color="primary"
                  component={Link}
                  to={GET_ROUTE_NAME('EDIT_COMPANY', { uuid: row['cell']['value'] })}
                >
                  <EditOutlined />
                  <span>Edit</span>
                </ArgonButton>
              </div>
            )
          },
        },
      ])
      setRows(data['companies'])
    })
  }

  useEffect(() => {
    SET_PAGE_TITLE('Onboarded Companies')
    let isSubscribed = true
    if (isSubscribed) {
      fetchData()
    }
    return () => {
      isSubscribed = false
    }
  }, [])

  return (
    <>
      <DashboardLayout breadcrumbTitle="Onboarded Companies">
        <CardWrapper
          headerTitle={'Onboarded Companies'}
          headerActionButton={() => {
            return (
              <HasPermissionButton
                color="primary"
                route={GET_ROUTE_NAME('ADD_COMPANY')}
                permissions={['/dashboard/company/create']}
                text={`Add New Company`}
                icon={<AddBox />}
              />
            )
          }}
        >
          <Box sx={{ margin: '-10px 20px 20px 20px' }}>
            <DataTable
              table={{
                columns: columns,
                rows: rows,
              }}
              canSearch={true}
            />
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}
export default Companies
