import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Add, Edit } from '@mui/icons-material'
import { Button } from '@mui/material'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { DashboardLayout } from 'layouts'
import { ArgonSnackbar, ArgonBox } from 'components/ArgonTheme'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import DataTable from 'slots/Tables/DataTable'
import ArgonBadge from 'components/ArgonBadge'
import CardWrapper from 'slots/Cards/CardWrapper'

function Instruments() {
  var { state } = useLocation()
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [backdropOpen, setBackdropOpen] = useState(false)
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

  const fetchInstrument = async () => {
    HTTP_CLIENT(APIFY('/v1/instruments'), { params: {} }).then((response) => {
      const instruments = response['instruments']
      setColumns([
        {
          accessor: 'id',
          Header: 'S. No.',
          width: 10,
          Cell: (row) => {
            return <>{row.cell.value + '.'}</>
          },
        },
        { accessor: 'name', Header: 'Name' },
        { accessor: 'short_name', Header: 'Short Name' },
        {
          accessor: 'instrument_sub_category',
          Header: 'Sub Category',
          Cell: (row) => {
            return <>{row.cell.value?.category_name}</>
          },
        },
        {
          accessor: 'rating_symbol_category',
          Header: 'Rating Symbol Category',
          Cell: (row) => {
            return <>{row.cell.value?.symbol_type_category}</>
          },
        },
        {
          accessor: 'is_active',
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
          accessor: 'uuid',
          Header: '',
          align: 'right',
          Cell: (row) => {
            return (
              <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
                <HasPermissionButton
                  color="primary"
                  permissions={['/dashboard/company/master/instruments/edit']}
                  route={GET_ROUTE_NAME('EDIT_INSTRUMENT', { uuid: row.cell.value })}
                  text={`Edit`}
                  icon={<Edit />}
                />
              </ArgonBox>
            )
          },
        },
      ])
      instruments.forEach((instrument, key) => {
        instruments[key].id = key + 1
      })
      setRows(instruments)
    })
    setBackdropOpen(false)
  }

  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: '',
    })
  }

  useEffect(() => {
    SET_PAGE_TITLE(`Manage Instrument`)

    let ajaxEvent = true
    if (ajaxEvent) {
      fetchInstrument()
      if (state) {
        handleSuccessState()
      }
    }

    return () => {
      ajaxEvent = false
    }
  }, [])

  return (
    <DashboardLayout breadcrumbTitle="Manage Instrument">
      <CardWrapper
        headerTitle="Manage Instrument"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={['/dashboard/company/master/instruments/create']}
              route={GET_ROUTE_NAME('ADD_INSTRUMENT')}
              text={`Add New Instrument`}
              icon={<Add />}
            />
          )
        }}
        footerActionButton={() => {
          return <></>
        }}
      >
        <DataTable
          table={{
            columns: columns,
            rows: rows,
          }}
        />
        <ArgonSnackbar
          color={'success'}
          icon="success"
          title={
            snackbarParams.type === 'CREATE'
              ? 'Instrument Created Successfully'
              : snackbarParams.type === 'UPDATE'
              ? 'Instrument Updated Successfully'
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

export default Instruments
