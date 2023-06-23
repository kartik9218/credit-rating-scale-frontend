import { DashboardLayout } from 'layouts'
import React, { useEffect, useState } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'
import { ArgonBox } from 'components/ArgonTheme'
import { Box } from '@mui/material'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { useNavigate } from 'react-router-dom'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import InfomericsDataGrid from 'slots/Tables/InfomericDataGrid'
import { DoneOutlineSharp, ReorderOutlined } from '@mui/icons-material'
import { GENERATE_UUID } from 'helpers/Base'
import DataTable from 'slots/Tables/DataTable'
import EmptyBoxCard from 'slots/Cards/EmptBoxCard'

const Inbox = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])

  useEffect(() => {
    SET_PAGE_TITLE('Inbox')
    getInboxListing()
  }, [])

  const column = [
    {
      accessor: 'company_name',
      Header: 'Company',
    },
    {
      accessor: 'code',
      Header: 'Activity Code',
      Cell: (params) => <>{params.cell.value}</>,
    },
    {
      accessor: 'mandate_count',
      Header: 'No of Mandates',
      Cell: (params) => <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{params.cell.value}</Box>,
    },
    {
      accessor:"rating_process_name",
      Header: "Rating Process",
    },
    {
      accessor: 'activity_to_be_performed',
      Header: 'Activity To Be Performed',
      Cell: (params) => <Box sx={{ width: '200px' }}>{params.cell.value}</Box>,
    },
    {
      accessor: 'action',
      Header: 'Action',
      align: 'right',
      Cell: (params) => {
        return (
          <span
            style={{
              color:
                params.cell.row.original.code === '10500' || params.cell.row.original.code === '10550'
                  ? '#bab4e8'
                  : '#756ad2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => handleExecuteActivity(params)}
          >
            <DoneOutlineSharp />
            Execute
          </span>
        )
      },
    },
  ]

  const handleExecuteActivity = (params) => {
    if (params.cell.row.original.code === '10500' || params.cell.row.original.code === '10550') return;
    navigate(
      GET_ROUTE_NAME('EXECUTE', {
        activityCode: params.cell.row.original.code,
        companyUuid: params.cell.row.original.company_uuid,
        ratingUuid: params.cell.row.original.rating_process_uuid,
      }),
      {
        state: {
          activityTitle: params.cell.row.original.activity_to_be_performed,
        },
      },
    )
  }

  const getInboxListing = () => {
    HTTP_CLIENT(APIFY('/v1/inbox'), { params: {} })
      .then((success) => {
        const { companies } = success
        const companyList = Array.from(companies)
        companyList.forEach((obj) => Object.assign(obj, { uuid: GENERATE_UUID() }))
        setRows([...companies])
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <DashboardLayout>
      <CardWrapper headerTitle={'Inbox'}>
        <ArgonBox
          sx={{
            background: 'white !important',
            height: 'calc(100vh - 17vh)',
            marginTop: '-50px',
            borderRadius: '20px',
          }}
        >
          <ArgonBox p={'10px'}>
            {
              <DataTable
                table={{
                  columns: column,
                  rows: rows,
                }}
                isPaginationVisible={false}
                canSearch={true}
                entriesPerPage={{ entries: rows.length, defaultValue: rows.length }}
              />
              // : <EmptyBoxCard />
            }
          </ArgonBox>
        </ArgonBox>
      </CardWrapper>
    </DashboardLayout>
  )
}

export default Inbox
